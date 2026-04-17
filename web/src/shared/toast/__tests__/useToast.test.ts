import { toast as sonner } from 'sonner';
import { toast } from '../useToast';

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
  }),
}));

describe('toast facade', () => {
  afterEach(() => {
    vi.mocked(sonner.success).mockClear();
    vi.mocked(sonner.error).mockClear();
    vi.mocked(sonner.message).mockClear();
  });

  it('forwards success calls to sonner', () => {
    toast.success('Saved');
    expect(sonner.success).toHaveBeenCalledWith('Saved');
  });

  it('forwards error calls to sonner', () => {
    toast.error('Oops');
    expect(sonner.error).toHaveBeenCalledWith('Oops');
  });

  it('forwards info calls to sonner.message', () => {
    toast.info('Note');
    expect(sonner.message).toHaveBeenCalledWith('Note');
  });
});
