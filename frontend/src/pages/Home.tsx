import Loader from "@/components/Loader";
import PostsList from "@/components/PostsList/PostsList";
import { usePosts } from "@/hooks/usePosts";

const Home = () => {
  const { posts, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePosts();
  return (
    <div style={{ height: "85vh", width: "100vw" }}>
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
  );
};

export default Home;
