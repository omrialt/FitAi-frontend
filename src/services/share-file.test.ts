import { describe, it, expect, vi, beforeEach } from 'vitest';

const writeFile = vi.fn();
const share = vi.fn();
vi.mock('@capacitor/filesystem', () => ({
  Directory: { Cache: 'CACHE' },
  Filesystem: { writeFile: (...args: unknown[]) => writeFile(...args) },
}));
vi.mock('@capacitor/share', () => ({
  Share: { share: (...args: unknown[]) => share(...args) },
}));

import { blobToBase64, shareFile, stripDataUri } from './share-file';

describe('shareFile', () => {
  beforeEach(() => {
    writeFile.mockReset().mockResolvedValue({ uri: 'file:///cache/plan.pdf' });
    share.mockReset().mockResolvedValue({});
  });

  it('writes to the cache and opens the share sheet with that file', async () => {
    await shareFile('plan.pdf', 'QUJD', 'plan.pdf');

    expect(writeFile).toHaveBeenCalledWith({
      path: 'plan.pdf',
      data: 'QUJD',
      directory: 'CACHE',
    });
    expect(share).toHaveBeenCalledWith({
      title: 'plan.pdf',
      files: ['file:///cache/plan.pdf'],
    });
  });

  it('treats closing the share sheet as a choice, not an error', async () => {
    share.mockRejectedValue(new Error('Share canceled'));

    await expect(shareFile('plan.pdf', 'QUJD', 'plan.pdf')).resolves.toBeUndefined();
  });

  it('surfaces a real failure', async () => {
    share.mockRejectedValue(new Error('No app can handle this'));

    await expect(shareFile('plan.pdf', 'QUJD', 'plan.pdf')).rejects.toThrow();
  });
});

describe('base64 helpers', () => {
  it('strips the data URI prefix', () => {
    expect(stripDataUri('data:application/pdf;filename=x.pdf;base64,QUJD')).toBe('QUJD');
  });

  it('reads a Blob as bare base64', async () => {
    await expect(blobToBase64(new Blob(['ABC']))).resolves.toBe('QUJD');
  });
});
