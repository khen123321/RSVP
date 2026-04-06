import mongoose from 'mongoose';

const GuestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
    },
    pax: {
      type: Number,
      required: [true, 'Number of guests is required'],
      default: 1,
      min: 1,
      max: 10,
    },
    qr_token: {
      type: String,
      required: [true, 'QR token is required'],
      unique: true,
    },
    has_attended: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Guest || mongoose.model('Guest', GuestSchema);