import { useForm } from "@tanstack/react-form";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "@tanstack/react-router";
import { TextField, Button, Typography, Paper } from "@mui/material";
import { User } from "lucide-react";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";

const Login = () => {
  const [isGoogleErrorShown, setIsGoogleErrorShown] = useState(false);
  const { login, loginByToken, isLoggingIn, loginError, loginGoogle } =
    useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      loginByToken(accessToken, {
        onSuccess: () => navigate({ to: "/" }),
      });
    } else {
      console.log("No access token found, prompting for login...");
    }
  }, []);

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      login(value, {
        onSuccess: () => navigate({ to: "/" }),
      });
    },
  });

  const handleSuccessLogin = async (credentialResponse: CredentialResponse) => {
    loginGoogle(
      { credential: credentialResponse.credential },
      {
        onSuccess: () => navigate({ to: "/" }),
      }
    );
  };

  return (
    <Paper
      elevation={10}
      sx={{ 
        padding: 4, 
        maxWidth: 450, 
        margin: "auto", 
        mt: 4, 
        background: 'linear-gradient(135deg, #667eea 0%, #00d4ff 100%)', 
        color: 'white',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
      >
        <User size={24} />
        Login
      </Typography>

      <form
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) =>
              !value ? "Username is required" : undefined,
          }}
        >
          {(field) => (
            <TextField
              fullWidth
              label="Username"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={!!field.state.meta.errors?.length || !!loginError}
              helperText={field.state.meta.errors?.[0] || ""}
              sx={{ 
                mb: 2,
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiInputLabel-root': { color: 'white' },
                '& .MuiOutlinedInput-root': { 
                  '& fieldset': { borderColor: 'white' }, 
                  '&:hover fieldset': { borderColor: 'white' }, 
                  '&.Mui-focused fieldset': { borderColor: 'white' } 
                },
                '& .MuiFormHelperText-root': { color: 'white' }
              }}
            />
          )}
        </form.Field>
        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              !value ? "Password is required" : undefined,
          }}
        >
          {(field) => (
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={!!field.state.meta.errors?.length || !!loginError}
              helperText={field.state.meta.errors?.[0] || ""}
              sx={{ 
                mb: 2,
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiInputLabel-root': { color: 'white' },
                '& .MuiOutlinedInput-root': { 
                  '& fieldset': { borderColor: 'white' }, 
                  '&:hover fieldset': { borderColor: 'white' }, 
                  '&.Mui-focused fieldset': { borderColor: 'white' } 
                },
                '& .MuiFormHelperText-root': { color: 'white' }
              }}
            />
          )}
        </form.Field>
        {loginError && <Typography color="error">{loginError}</Typography>}
        <Button
          loading={isLoggingIn}
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoggingIn}
          sx={{ 
            mt: 1, 
            mb: 2, 
            backgroundColor: '#e94560', 
            '&:hover': { backgroundColor: '#f39c12' },
            color: 'white'
          }}
        >
          {isLoggingIn ? "Logging in..." : "Login"}
        </Button>
        <GoogleLogin
          width={100}
          onSuccess={handleSuccessLogin}
          onError={() => setIsGoogleErrorShown(true)}
        />
        {isGoogleErrorShown && (
          <Typography fontSize={15} color="error">
            Error logging in via Google
          </Typography>
        )}
        <Button
          fullWidth
          variant="text"
          sx={{ mt: 1, color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
          onClick={() => navigate({ to: "/register" })}
        >
          Don't have an account? Register
        </Button>
      </form>
    </Paper>
  );
};

export default Login;
