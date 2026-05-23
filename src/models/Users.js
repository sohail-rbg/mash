import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
    },

    image: {
      type: String,
    },

    phone: {
      type: String,
    },

    gender: {
      type: String,
    },

    profileComplete: {
      type: Boolean,
      default: false,
    },

    questionnaire: [
      {
        questionId: String,
        answer: [String],
      },
    ],
  },
  { timestamps: true }
);

// Export single model
export default mongoose.models.User || mongoose.model("User", UserSchema);