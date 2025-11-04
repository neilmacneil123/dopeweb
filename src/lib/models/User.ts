import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  cash: {
    type: Number,
    default: 2000,
  },
  debt: {
    type: Number,
    default: 5500,
  },
  bankAccount: {
    type: Number,
    default: 0,
  },
  rank: {
    type: String,
    default: 'Newbie',
  },
  highScore: {
    type: Number,
    default: 0,
  },
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export type UserDocument = mongoose.Document & {
  username: string;
  password: string;
  cash: number;
  debt: number;
  bankAccount: number;
  rank: string;
  highScore: number;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
};

export default mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);