import { ObjectId } from 'bson';

export class UniqueEntityID {
  private value: ObjectId;

  toString() {
    return this.value.toString();
  }

  toValue() {
    return this.value;
  }

  constructor(value?: ObjectId) {
    this.value = value ?? new ObjectId();
  }

  public equals(id: UniqueEntityID) {
    return this.value.equals(id.value);
  }
}
