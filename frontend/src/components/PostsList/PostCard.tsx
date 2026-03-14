import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import { Edit, Heart, MessageCircle } from "lucide-react";
import { Post } from "../../types";
import { useNavigate } from "@tanstack/react-router";
import { useLike } from "@/hooks/useLike";
import { useEffect } from "react";
import { useUser } from "@/hooks/useUser";

const PostCard = ({
  post,
  expandComments,
}: {
  post: Post;
  expandComments: (number: Post["commentsCount"]) => void;
}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { isLiked, toggleLiked, isUpdating, likedCount } = useLike(post.id);

  useEffect(() => {
    return () => {
      expandComments(0);
    };
  }, []);

  return (
    <Card
      sx={{
        padding: 2,
        width: "50vw",
        margin: "20px",
      }}
    >
      <CardHeader
        avatar={<Avatar src={post.user.image} />}
        title={post.user.username}
        onClick={() =>
          navigate({
            to: `/profile/${post.user.id}`,
          })
        }
        sx={{ cursor: "pointer" }}
        action={
          post.user.id === user?.id && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                navigate({
                  to: `/post/${post.id}`,
                });
              }}
              sx={{ color: "#f39c12" }}
            >
              <Edit size={20} />
            </IconButton>
          )
        }
      />
      <CardMedia
        sx={{ objectFit: "contain" }}
        component="img"
        height="250"
        image={post.image}
      />
      <CardContent>
        <Typography variant="body2" >
          {post.content}
        </Typography>
      </CardContent>
      <CardActions >
        <IconButton
          sx={{ outline: "none", "&:focus": { outline: "none" } }}
          onClick={() => !isUpdating && toggleLiked()}
        >
          {isLiked ? <Heart fill="black" /> : <Heart />}
        </IconButton>
        <Typography color="grey">{likedCount}</Typography>
        <IconButton
          sx={{
            outline: "none",
            "&:focus": { outline: "none" },
            cursor: "pointer",
          }}
          onClick={() => {
            navigate({ to: `/comments/${post.id}` });
          }}
        >
          <MessageCircle />
        </IconButton>
        <Typography color="grey">{0}</Typography>
      </CardActions>
    </Card>
  );
};

export default PostCard;
