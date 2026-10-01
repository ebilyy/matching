import {Exclude, Expose} from 'class-transformer';

@Exclude()
export abstract class AbstractDto<T = unknown> {
	@Expose()
	createdAt: Date;

	@Expose()
	isDeleted: boolean;

	@Expose()
	updatedAt: Date;

	constructor(data?: Partial<T>) {
		Object.assign(this, data);
	}
}
