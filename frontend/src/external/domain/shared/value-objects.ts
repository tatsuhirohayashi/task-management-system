/**
 * Value Objects
 * ドメイン設計書に基づく共通のValue Object定義
 */

/**
 * Email Value Object
 * ルール: 「@」が必ずある/空NG/前後の空白トリム
 */
export class Email {
  private constructor(private readonly value: string) { }

  static create(value: string): Email {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error('Emailは空文字列にできません');
    }
    if (!trimmed.includes('@')) {
      throw new Error('Emailには「@」が必須です');
    }
    return new Email(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

/**
 * Priority Value Object
 * ルール: HighまたはMediumまたはLowだけOK
 */
export type PriorityValue = 'High' | 'Medium' | 'Low';

export class Priority {
  private constructor(private readonly value: PriorityValue) { }

  static create(value: string): Priority {
    if (value !== 'High' && value !== 'Medium' && value !== 'Low') {
      throw new Error('PriorityはHigh、Medium、Lowのいずれかである必要があります');
    }
    return new Priority(value as PriorityValue);
  }

  getValue(): PriorityValue {
    return this.value;
  }

  equals(other: Priority): boolean {
    return this.value === other.value;
  }

  static High(): Priority {
    return new Priority('High');
  }

  static Medium(): Priority {
    return new Priority('Medium');
  }

  static Low(): Priority {
    return new Priority('Low');
  }
}

/**
 * Density Value Object
 * ルール: HighまたはMediumまたはLowだけOK
 */
export type DensityValue = 'High' | 'Medium' | 'Low';

export class Density {
  private constructor(private readonly value: DensityValue) { }

  static create(value: string): Density {
    if (value !== 'High' && value !== 'Medium' && value !== 'Low') {
      throw new Error('DensityはHigh、Medium、Lowのいずれかである必要があります');
    }
    return new Density(value as DensityValue);
  }

  getValue(): DensityValue {
    return this.value;
  }

  equals(other: Density): boolean {
    return this.value === other.value;
  }

  static High(): Density {
    return new Density('High');
  }

  static Medium(): Density {
    return new Density('Medium');
  }

  static Low(): Density {
    return new Density('Low');
  }
}

/**
 * DurationTime Value Object
 * ルール: 60または45または30または15だけOK
 */
export type DurationTimeValue = 60 | 45 | 30 | 15;

export class DurationTime {
  private constructor(private readonly value: DurationTimeValue) { }

  static create(value: number): DurationTime {
    if (value !== 60 && value !== 45 && value !== 30 && value !== 15) {
      throw new Error('DurationTimeは60、45、30、15のいずれかである必要があります');
    }
    return new DurationTime(value as DurationTimeValue);
  }

  getValue(): DurationTimeValue {
    return this.value;
  }

  equals(other: DurationTime): boolean {
    return this.value === other.value;
  }

  static Sixty(): DurationTime {
    return new DurationTime(60);
  }

  static FortyFive(): DurationTime {
    return new DurationTime(45);
  }

  static Thirty(): DurationTime {
    return new DurationTime(30);
  }

  static Fifteen(): DurationTime {
    return new DurationTime(15);
  }
}

/**
 * Status Value Object
 * ルール: NotStartedまたはInProgressまたはCompletedだけOK
 */
export type StatusValue = 'NotStarted' | 'InProgress' | 'Completed';

export class Status {
  private constructor(private readonly value: StatusValue) { }

  static create(value: string): Status {
    if (value !== 'NotStarted' && value !== 'InProgress' && value !== 'Completed') {
      throw new Error('StatusはNotStarted、InProgress、Completedのいずれかである必要があります');
    }
    return new Status(value as StatusValue);
  }

  getValue(): StatusValue {
    return this.value;
  }

  equals(other: Status): boolean {
    return this.value === other.value;
  }

  static NotStarted(): Status {
    return new Status('NotStarted');
  }

  static InProgress(): Status {
    return new Status('InProgress');
  }

  static Completed(): Status {
    return new Status('Completed');
  }
}

