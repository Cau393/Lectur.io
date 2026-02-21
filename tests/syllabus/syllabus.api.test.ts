import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { generateText } from 'ai';
import { POST } from '@/app/api/syllabus/route';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('ai', () => ({
  generateText: vi.fn(),
  Output: {
    object: vi.fn((opts: { schema: unknown }) => opts),
  },
}));

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => 'mock-openai'),
}));

function createRequest(body: object) {
  return new Request('http://localhost:3000/api/syllabus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/syllabus', () => {
  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
  });

  it('returns 401 when user is not authenticated', async () => {
    vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    } as never);

    const req = createRequest({ subjectName: 'Quantum Physics' });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
    expect(generateText).not.toHaveBeenCalled();
  });

  it('returns 400 when subjectName is missing', async () => {
    vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    } as never);

    const req = createRequest({});
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('subjectName is required');
    expect(generateText).not.toHaveBeenCalled();
  });

  it('returns 400 when subjectName is not a string', async () => {
    vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    } as never);

    const req = createRequest({ subjectName: 123 });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('subjectName is required');
  });

  it('returns 500 when AI fails to generate syllabus', async () => {
    vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    } as never);

    vi.mocked(generateText).mockResolvedValue({
      experimental_output: { classes: [] },
    } as never);

    const req = createRequest({ subjectName: 'Quantum Physics' });
    const res = await POST(req);

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Failed to generate syllabus');
  });

  it('returns 200 and subjectId when syllabus is generated successfully', async () => {
    vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    } as never);

    const mockClasses = [
      {
        order_index: 0,
        title: 'Introduction',
        topics: ['Topic 1', 'Topic 2'],
        duration_minutes: 80 as const,
      },
    ];

    vi.mocked(generateText).mockResolvedValue({
      experimental_output: { classes: mockClasses },
    } as never);

    const subjectInsertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'subject-uuid-123' },
        error: null,
      }),
    };

    const classesInsertChain = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    vi.mocked(mockSupabase.from)
      .mockReturnValueOnce(subjectInsertChain as never)
      .mockReturnValueOnce(classesInsertChain as never);

    const req = createRequest({ subjectName: 'Quantum Physics' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    // 200 response output: { subjectId: string }
    console.log('200 response output:', JSON.stringify(data, null, 2));
    expect(data.subjectId).toBe('subject-uuid-123');
    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('Quantum Physics'),
      })
    );
  });
});
