import { User } from "@/types";
import { Avatar } from "@mui/material";
import { Camera } from "lucide-react";
import { ChangeEvent } from "react";

interface IAvatarUploadProps {
  image: User["image"];
  handleImageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  size?: number;
  displayOnly?: boolean;
}

const AvatarUpload: React.FC<IAvatarUploadProps> = ({
  image,
  handleImageChange,
  size = 90,
  displayOnly = false,
}) => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <label
        htmlFor={displayOnly ? "" : "image-upload"}
        style={{ cursor: displayOnly ? "default" : "pointer" }}
      >
        <Avatar
          src={image}
          style={{
            width: size,
            height: size,
            border: "3px solid #ccc",
            transition: "0.3s",
            cursor: displayOnly ? "default" : "pointer",
          }}
          onMouseOver={(e) =>
            !displayOnly && (e.currentTarget.style.filter = "brightness(0.7)")
          }
          onMouseOut={(e) =>
            !displayOnly && (e.currentTarget.style.filter = "brightness(1)")
          }
        />

        {!displayOnly && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              background: "rgba(0, 0, 0, 0.7)",
              borderRadius: "50%",
              width: size / 3,
              height: size / 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Camera width={size / 5} height={size / 5} color="white" />
          </div>
        )}
      </label>

      {!displayOnly && (
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
      )}
    </div>
  );
};

export default AvatarUpload;
