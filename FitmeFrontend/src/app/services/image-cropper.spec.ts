import { TestBed } from '@angular/core/testing';

import { ImageCropper } from './image-cropper';

describe('ImageCropper', () => {
  let service: ImageCropper;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageCropper);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
