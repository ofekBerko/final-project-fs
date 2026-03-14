import { CircularProgress } from "@mui/material";

interface ILoaderProps {
  isLoading: boolean;
}

const Loader: React.FC<ILoaderProps> = ({ isLoading }) => {
  return isLoading ? (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress size={"100px"} />
    </div>
  ) : null;
};

export default Loader;
