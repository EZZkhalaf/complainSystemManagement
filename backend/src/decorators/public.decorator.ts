import { SetMetadata } from '@nestjs/common';

export const META_PUBLIC = 'Public';

export const Public = () => SetMetadata(META_PUBLIC, true);
