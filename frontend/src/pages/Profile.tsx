import AvatarUpload from "@/components/AvatarUpload";
import { DEFAULT_USER_IMAGE, useUser } from "@/hooks/useUser";
import { ChangeEvent, useEffect, useState } from "react";
import { Button, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useProfile } from "@/hooks/useProfile";
import { User } from "@/types";
import { usePosts } from "@/hooks/usePosts";
import PostsList from "@/components/PostsList/PostsList";
import Loader from "@/components/Loader";

const Profile = () => {
  const { user } = useUser();
  const { id } = useParams({ strict: false });
  const { profile, updateProfile, updateError, refetchProfile } =
    useProfile(id);
  const { posts, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePosts(profile?.id);
  const [editingMode, setEditingMode] = useState(false);
  const [updatedImageUrl, setUpdatedImageUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [updatedUsername, setUpdatedUsername] = useState<User["username"] | null>(null);

  const navigate = useNavigate();

  const isSelf = profile?.id === user?.id;

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setUpdatedImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!id && user) {
      navigate({
        to: `/profile/${user.id}`,
        replace: true,
      });
    }
  }, [user, id, navigate]);

  if (!user || !profile)
    return <Typography variant="h5">User not found</Typography>;

  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "row" }}>
      <div
        style={{
          width: "30%",
          padding: "20px",
          borderRight: "1px solid #ccc",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}
        >
          <AvatarUpload
            image={updatedImageUrl ?? profile.image ?? DEFAULT_USER_IMAGE}
            handleImageChange={editingMode ? handleImageChange : undefined}
            size={100}
            displayOnly={!editingMode}
          />
        </div>

        {editingMode ? (
          <TextField
            fullWidth
            label="Username"
            value={updatedUsername ?? user.username}
            onChange={(e) => setUpdatedUsername(e.target.value)}
            autoFocus
            sx={{
              marginBottom: 2,
              color: "white",
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiInputLabel-root": { color: "white" },
            }}
          />
        ) : (
          <Typography variant="h4" style={{ marginBottom: 8 }}>
            {profile.username}
          </Typography>
        )}

        <Typography variant="subtitle1" style={{ marginBottom: 16 }}>
          {profile.email}
        </Typography>

        {updateError && <Typography color="error" style={{ marginBottom: 16 }}>{updateError}</Typography>}

        {isSelf ? (
          editingMode ? (
            <Button
              sx={{ 
                color: "white", 
                backgroundColor: '#28a745', 
                '&:hover': { backgroundColor: '#218838' },
                borderRadius: '20px',
                padding: '8px 16px',
                marginBottom: 16
              }}
              onClick={() => {
                updateProfile(
                  {
                    id: user.id,
                    username: updatedUsername,
                    image: selectedImage,
                  },
                  {
                    onSuccess: () => {
                      refetchProfile();
                      setEditingMode(false);
                    },
                  }
                );
              }}
            >
              Save Changes
            </Button>
          ) : (
            <Button
              sx={{ 
                color: "white", 
                backgroundColor: '#e94560', 
                '&:hover': { backgroundColor: '#f39c12' },
                borderRadius: '20px',
                padding: '8px 16px',
                marginBottom: 16
              }}
              onClick={() => setEditingMode(true)}
            >
              Edit Profile
            </Button>
          )
        ) : null}
      </div>
      <div style={{ width: "70%", height: "100%", overflowY: "auto", padding: "20px" }}>
        <Loader isLoading={isLoading} />
        {posts && (
          <PostsList
            posts={posts}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
