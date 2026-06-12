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

    clerkId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
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
    savedFoods: [
      {
        foodName: {
          type: String,
          required: true,
        },
        foodImage: {
          type: String,
          required: false,
        },
        foodCategory: {
          type: String,
          required: false,
        },
        dietType: {
          type: String,
          required: false,
        },
        mealTiming: {
          type: String,
          required: false,
        },
        savedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Export single model
export default mongoose.models.User || mongoose.model("User", UserSchema);