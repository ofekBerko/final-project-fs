import CommentsList from "@/components/PostsList/CommentsList";
import { Box } from "@mui/material";
import { useParams } from "@tanstack/react-router";

const Comments = () => {
  const { postId } = useParams({ strict: false });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: "80%",
          height: "100%",
          border: "2px solid #a3caed",
          borderRadius: "20px",
          backgroundColor: "#f0f4f8",
        }}
      >
        <CommentsList postId={postId}/>
      </Box>
    </div>
  );
};

export default Comments;
