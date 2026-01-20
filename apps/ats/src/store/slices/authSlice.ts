import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from '@/api/axios';

/**
 * AuthSlice - Migrado a cookies httpOnly
 *
 * El token ya NO se almacena en localStorage ni en el estado de Redux.
 * Los tokens se manejan automáticamente via cookies httpOnly por el backend.
 * El frontend solo mantiene la información del usuario autenticado.
 */

export interface BetaInfo {
  isBeta: boolean;
  betaEndsAt: string | null;
  isBetaExpired: boolean;
  isBetaEndingSoon: boolean;
  betaDaysRemaining: number | null;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string | null;
  /** Tipo de cuenta de la organización (freelance o company) */
  accountType: 'freelance' | 'company' | null;
  isVerified: boolean;
  /** Indica si la organización tiene un plan activo (true para candidatos siempre) */
  hasActivePlan: boolean;
  /** Info de beta si el usuario está en un plan beta */
  betaInfo: BetaInfo | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  isAuthLoading: true, // Inicia en true para verificar sesión al cargar
  error: null,
};

/**
 * Verifica la sesión actual llamando al endpoint /me.
 * El backend lee el token de la cookie httpOnly.
 */
export const checkSession = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/auth/me');
      return response.data.data;
    } catch {
      return rejectWithValue('No hay sesión activa');
    }
  }
);

/**
 * Refresca el access token usando el refresh token (cookie httpOnly).
 */
export const refreshSession = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/auth/refresh');
      return response.data.data.user;
    } catch {
      return rejectWithValue('No se pudo refrescar la sesión');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Login exitoso - el backend ya setea las cookies httpOnly.
     * Solo guardamos la información del usuario en el estado.
     */
    loginSuccess: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.isAuthLoading = false;
      state.error = null;
    },

    /**
     * Logout - limpia el estado.
     * El backend limpia las cookies httpOnly.
     */
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.isAuthLoading = false;
      state.error = null;
    },

    /**
     * Actualiza la información del usuario.
     */
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },

    /**
     * Marca que la carga de autenticación ha finalizado.
     */
    finishAuthLoading: (state) => {
      state.isAuthLoading = false;
    },

    /**
     * Limpia errores de autenticación.
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // checkSession
    builder
      .addCase(checkSession.pending, (state) => {
        state.isAuthLoading = true;
        state.error = null;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.isAuthLoading = false;
        state.error = null;
      })
      .addCase(checkSession.rejected, (state) => {
        state.user = null;
        state.isLoggedIn = false;
        state.isAuthLoading = false;
      });

    // refreshSession
    builder
      .addCase(refreshSession.pending, (state) => {
        state.error = null;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(refreshSession.rejected, (state, action) => {
        state.user = null;
        state.isLoggedIn = false;
        state.error = action.payload ?? 'Error al refrescar sesión';
      });
  },
});

export const { loginSuccess, logout, setUser, finishAuthLoading, clearError } = authSlice.actions;
export default authSlice.reducer;
