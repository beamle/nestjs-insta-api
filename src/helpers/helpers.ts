import { Types } from "mongoose";

export function toObjectId(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID format');
  }
  return new Types.ObjectId(id);
}