import { useContent } from "@/hooks/useContent";
import { usePosts } from "@/hooks/usePosts";
import { useUser } from "@/hooks/useUser";
import { ContentType } from "@/types";
import {
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useParams } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";

const Post = () => {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [postContent, setPostContent] = useState<string>("");
  const [chosenContentType, setChosenContentType] = useState<ContentType>(ContentType.JOKE);

  const { id } = useParams({ strict: false });
  const { user } = useUser();
  const { generateContent } = useContent();
  const { createPostMutation, updatePostMutation, deletePostMutation, posts } =
    usePosts();

  useEffect(() => {
    if (id) {
      const currentPost = posts.find((post) => post.id === id);
      if (currentPost) {
        setPostContent(currentPost.content);
        setPreviewImageUrl(currentPost.image);
      }
    }
  }, [id]);

  const handleContentGenerate = async (contentType: ContentType) => {
    const newContent = await generateContent(contentType);
    setPostContent(newContent);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (file) {
      setUploadedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          width: "100%",
          padding: "20px 50px",
          alignItems: "center",
          height: "90%",
          backgroundColor: '#1a1a2e',
          color: 'white',
          minHeight: '80vh'
        }}
      >
        <Box
          sx={{
            width: "600px",
            height: "600px",
            display: "flex",
            alignItems: "center",
            background: previewImageUrl ? "none" : "#0f3460",
            border: "2px solid #667eea",
            justifyContent: "center",
            borderRadius: "25px",
            padding: "10px",
            overflow: "hidden",
            marginRight: "50px"
          }}
        >
          {previewImageUrl ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "flex-end",
                width: "100%",
                height: "100%",
              }}
            >
              <img
                src={previewImageUrl}
                alt="Preview"
                style={{
                  objectFit: "contain",
                  width: "100%",
                  height: "100%",
                }}
              />
              <label htmlFor="upload-photo-input">
                <Button component="span" sx={{ color: 'white', backgroundColor: '#e94560', '&:hover': { backgroundColor: '#f39c12' }, borderRadius: '20px', padding: '8px 16px' }}>
                  Change Photo
                  <input
                    id="upload-photo-input"
                    accept="image/*"
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                </Button>
              </label>
            </div>
          ) : (
            <label htmlFor="upload-photo-input">
              <IconButton color="primary" component="span" sx={{ color: 'white', backgroundColor: '#667eea', '&:hover': { backgroundColor: '#00d4ff' } }}>
                <Upload />
                <input
                  id="upload-photo-input"
                  accept="image/*"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </IconButton>
            </label>
          )}
        </Box>

        <div style={{ padding: "20px 50px", width: "60%", display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <TextField
            sx={{ 
              width: "100%", 
              borderRadius: "25px",
              '& .MuiInputBase-input': { color: 'white', fontSize: '1.2rem' },
              '& .MuiOutlinedInput-root': { 
                '& fieldset': { borderColor: '#667eea' }, 
                '&:hover fieldset': { borderColor: '#00d4ff' }, 
                '&.Mui-focused fieldset': { borderColor: '#00d4ff' } 
              }
            }}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Write something about the post"
            multiline
            rows={12}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "30px",
              justifyContent: 'center',
              gap: '20px'
            }}
          >
            <Typography sx={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>Generate content: </Typography>
            <Select
              value={chosenContentType}
              onChange={(e) => setChosenContentType(e.target.value as ContentType)}
              sx={{
                color: 'white',
                backgroundColor: '#667eea',
                '& .MuiSelect-icon': { color: 'white' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#667eea' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00d4ff' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00d4ff' },
                borderRadius: '20px',
                minWidth: 120
              }}
            >
              <MenuItem value={ContentType.JOKE}>Joke</MenuItem>
              <MenuItem value={ContentType.QUOTE}>Quote</MenuItem>
              <MenuItem value={ContentType.FUN_FACT}>Fun fact</MenuItem>
              <MenuItem value={ContentType.RIDDLE}>Riddle</MenuItem>
            </Select>
            <Button onClick={() => handleContentGenerate(chosenContentType)} sx={{ color: 'white', backgroundColor: '#e94560', '&:hover': { backgroundColor: '#f39c12' }, borderRadius: '20px', padding: '8px 16px' }}>
              Generate
            </Button>
          </div>
          <Divider sx={{ backgroundColor: '#667eea', margin: '30px 0' }} />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: '20px'
            }}
          >
            <Button
              size="large"
              sx={{ 
                marginTop: "10px",
                backgroundColor: '#667eea',
                color: 'white',
                '&:hover': { backgroundColor: '#00d4ff' },
                fontSize: '1.2rem',
                padding: '15px 30px',
                borderRadius: '20px'
              }}
              disabled={!postContent.length || !previewImageUrl}
              onClick={() => {
                if (user && postContent && previewImageUrl)
                  id
                    ? updatePostMutation.mutate({
                        postId: id as string,
                        content: postContent,
                        image: uploadedImage,
                      })
                    : createPostMutation.mutate({
                        content: postContent,
                        image: uploadedImage,
                      });
              }}
            >
              {id ? "SAVE" : "POST"}
            </Button>
            {id && (
              <Button
                size="large"
                sx={{ 
                  marginTop: "10px",
                  backgroundColor: '#e94560',
                  color: 'white',
                  '&:hover': { backgroundColor: '#f39c12' },
                  fontSize: '1.2rem',
                  padding: '15px 30px',
                  borderRadius: '20px'
                }}
                onClick={() => {
                  deletePostMutation.mutate({ postId: id });
                }}
              >
                {"DELETE"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
