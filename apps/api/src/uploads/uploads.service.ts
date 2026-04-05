import { Injectable, NotFoundException } from '@nestjs/common';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  return delay(1000 + Math.random() * 2000);
}

@Injectable()
export class UploadsService {
  private files: UploadedFile[] = [
    {
      id: 'demo-1',
      name: 'project-proposal.pdf',
      size: 2_450_000,
      type: 'application/pdf',
      uploadedAt: '2025-12-15T10:30:00Z',
    },
    {
      id: 'demo-2',
      name: 'team-photo.jpg',
      size: 1_800_000,
      type: 'image/jpeg',
      uploadedAt: '2025-12-14T14:20:00Z',
    },
    {
      id: 'demo-3',
      name: 'quarterly-report.docx',
      size: 980_000,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: '2025-12-13T09:15:00Z',
    },
  ];

  async getUploadedFiles(): Promise<UploadedFile[]> {
    await delay(600 + Math.random() * 200);
    return [...this.files];
  }

  async uploadFile(data: {
    name: string;
    size: number;
    type: string;
  }): Promise<UploadedFile> {
    await randomDelay();

    // 15% random failure rate
    if (Math.random() < 0.15) {
      throw new Error('Upload failed. Please try again.');
    }

    const file: UploadedFile = {
      id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: data.name,
      size: data.size,
      type: data.type,
      uploadedAt: new Date().toISOString(),
    };

    this.files.unshift(file);
    return file;
  }

  async deleteFile(id: string): Promise<{ message: string }> {
    await delay(400 + Math.random() * 200);

    const index = this.files.findIndex((f) => f.id === id);
    if (index === -1) {
      throw new NotFoundException('File not found.');
    }

    this.files.splice(index, 1);
    return { message: 'File deleted.' };
  }
}
