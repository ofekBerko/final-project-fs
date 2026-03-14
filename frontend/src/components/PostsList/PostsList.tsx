import { Box, Typography } from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";
import { Post } from "../../types";
import Loader from "@/components/Loader";
import PostCard from "@/components/PostsList/PostCard";

const PostsList = ({
  posts,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: {
  posts: Post[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const virtualList = useVirtualizer({
    count: posts.length + 1,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 510,
    overscan: 10,
  });

  useEffect(() => {
    const lastItem = [...virtualList.getVirtualItems()].pop();
    if (!lastItem) return;

    if (
      lastItem.index >= posts.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    posts.length,
    isFetchingNextPage,
    virtualList.getVirtualItems(),
  ]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        justifyItems: "center",
      }}
    >
      <div
        style={{
          height: `${virtualList.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualList.getVirtualItems().map((listItem) => {
          const isLoaderRow = listItem.index >= posts.length;
          const post = posts[listItem.index];

          return (
            <div
              key={listItem.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                display: "flex",
                justifyContent: "center",
                height: `${listItem.size}px`,
                transform: `translateY(${listItem.start}px)`,
              }}
            >
              {isLoaderRow ? (
                hasNextPage ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      padding: 2,
                    }}
                  >
                    <Loader isLoading />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      margin: 2,
                      height: "100%",
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <Typography color="grey">
                      🎉 That's all for now! No more posts to show.
                    </Typography>
                  </Box>
                )
              ) : (
                <PostCard
                  post={post}
                  expandComments={(commentsCount: Post["commentsCount"]) => {
                    virtualList.resizeItem(
                      listItem.index,
                      510 + commentsCount * 50
                    );
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </Box>
  );
};

export default PostsList;
