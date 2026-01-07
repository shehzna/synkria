import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  name: string;
  email: string;
  age?: number;
  cycleLength?: number;
  avatar?: string;
}

interface UserState {
  profile: UserProfile | null;
  isEditing: boolean;
}

const initialState: UserState = {
  profile: null,
  isEditing: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    setEditing: (state, action: PayloadAction<boolean>) => {
      state.isEditing = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.isEditing = false;
    },
  },
});

export const { setProfile, updateProfile, setEditing, clearProfile } = userSlice.actions;
export default userSlice.reducer;
