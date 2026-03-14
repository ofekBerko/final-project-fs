import { useRegister } from "@/hooks/useRegister";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { TextField, Button, Typography, Paper } from "@mui/material";
import { UserPlus } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { DEFAULT_USER_IMAGE } from "@/hooks/useUser";
import AvatarUpload from "@/components/AvatarUpload";
const Register = () => {
  const { register, isRegistering, registerError } = useRegister();
  const navigate = useNavigate();
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_USER_IMAGE);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (file) {
      setImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const convertUrlToFile = async (url: string) => {
      try {
        const response = await fetch(url);

        const blob = await response.blob();
        const file = new File([blob], "default-image.jpg", { type: blob.type });
        setImage(file);
      } catch (error) {
        console.error("Error fetching the default image:", error);
      }
    };

    convertUrlToFile(DEFAULT_USER_IMAGE);
  }, []);

  const form = useForm({
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      register(
        { ...value, image },
        {
          onSuccess: () => navigate({ to: "/" }),
          onError: (error) => {
            if (error.message.includes("Username is already taken")) {
              setUsernameError("Username is already taken");
            } else if (error.message.includes("Email is already in use")) {
              setEmailError("Email is already in use");
            }
          },
        }
      );
    },
  });

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
        <UserPlus size={24} />
        Register
      </Typography>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <AvatarUpload image={imageUrl} handleImageChange={handleImageChange} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              setEmailError("");
              return !value
                ? "Email is required"
                : !/^\S+@\S+\.\S+$/.test(value)
                ? "Invalid email format"
                : undefined;
            },
          }}
        >
          {(field) => (
            <TextField
              fullWidth
              label="Email"
              onChange={(e) => field.handleChange(e.target.value)}
              error={!!field.state.meta.errors?.length || !!emailError}
              helperText={field.state.meta.errors?.[0] || emailError || ""}
              sx={{ 
                mt: 2,
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
          name="username"
          validators={{
            onChange: ({ value }) => {
              setUsernameError("");
              return !value ? "Username is required" : undefined;
            },
          }}
        >
          {(field) => (
            <TextField
              fullWidth
              label="Username"
              onChange={(e) => field.handleChange(e.target.value)}
              error={!!field.state.meta.errors?.length || !!usernameError}
              helperText={field.state.meta.errors?.[0] || usernameError || ""}
              sx={{ 
                mt: 2,
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
              onChange={(e) => field.handleChange(e.target.value)}
              error={!!field.state.meta.errors?.length}
              helperText={field.state.meta.errors?.[0] || ""}
              sx={{ 
                mt: 2,
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
          name="confirmPassword"
          validators={{
            onChange: ({ value }) => {
              const passwordValue = form.getFieldValue("password");
              return !value
                ? "Confirm Password is required"
                : value !== passwordValue
                ? "Passwords do not match"
                : undefined;
            },
          }}
        >
          {(field) => (
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              onChange={(e) => field.handleChange(e.target.value)}
              error={!!field.state.meta.errors?.length}
              helperText={field.state.meta.errors?.[0] || ""}
              sx={{ 
                mt: 2,
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

        {registerError && (
          <Typography color="error">{registerError}</Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ 
            mt: 2, 
            backgroundColor: '#e94560', 
            '&:hover': { backgroundColor: '#f39c12' },
            color: 'white'
          }}
          disabled={isRegistering}
        >
          {isRegistering ? "Registering..." : "Register"}
        </Button>
      </form>
    </Paper>
  );
};

export default Register;
