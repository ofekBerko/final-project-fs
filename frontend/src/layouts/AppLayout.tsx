import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import {
  AppBar,
  Toolbar,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import { ArrowLeft, CirclePlus, Home, LogIn } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";

const AppLayout = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const router = useRouter();
  const location = useLocation();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [updateKey, setUpdateKey] = useState(0);
  const handleMenuClose = () => setMenuAnchor(null);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      <AppBar
        position="static"
        sx={{
          height: "12vh",
          display: "flex",
          justifyContent: "center",
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          alignContent: "center",
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <Toolbar
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            "&.MuiToolbar-root": { padding: 0 },
          }}
        >

          {user && (<div
            style={{
              display: "flex",
              gap: 15,
              paddingLeft: "1vw",
            }}
          >
            <Button
              sx={{ 
                color: "white", 
                backgroundColor: '#e94560', 
                '&:hover': { backgroundColor: '#f39c12' },
                borderRadius: '20px',
                padding: '8px 16px'
              }}
              startIcon={<Home size={20} />}
              onClick={() => {
                if (window.location.pathname === "/") {
                  setUpdateKey((prev) => prev + 1);
                } else {
                  navigate({ to: "/" });
                }
              }}
            >
              Discover
            </Button>
            <Button
              sx={{ 
                color: "white", 
                backgroundColor: '#00d4ff', 
                '&:hover': { backgroundColor: '#667eea' },
                borderRadius: '20px',
                padding: '8px 16px'
              }}
              startIcon={<CirclePlus size={20} />}
              onClick={() => navigate({ to: "/post" })}
            >
              New Post
            </Button>
          </div>)}
          <div style={{ paddingRight: "1vw" }}>
            {user ? (
              <>
                <Avatar
                  src={user.image}
                  alt={user.username}
                  sx={{ width: 40, height: 40, marginRight: 2 }}
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  style={{ cursor: "pointer" }}
                />
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                    onClick={() => {
                      navigate({
                        to: `/profile`,
                      });
                      handleMenuClose();
                    }}
                  >
                    My Account
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      logout();
                      handleMenuClose();
                    }}
                  >
                    Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={Link}
                to="/login"
                sx={{ 
                  color: "white", 
                  backgroundColor: '#1b263b', 
                  '&:hover': { backgroundColor: '#415a77' },
                  borderRadius: '20px',
                  padding: '8px 16px'
                }}
                startIcon={<LogIn size={20} />}
              >
                Sign In
              </Button>
            )}
          </div>
        </Toolbar>
      </AppBar>
      {location.pathname !== "/login" && location.pathname !== "/" && (
        <Button
          onClick={() => {
            router.history.go(-1);
          }}
          sx={{
            position: "fixed",
            bottom: "20px",
            left: "20px",
            backgroundColor: "#e94560",
            color: "white",
            borderRadius: "25px",
            padding: "10px 20px",
            fontSize: "1rem",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            "&:hover": { 
              backgroundColor: "#f39c12",
              transform: "scale(1.05)"
            },
            zIndex: 1000
          }}
          startIcon={<ArrowLeft size={20} />}
        >
          Back
        </Button>
      )}
      <div
        style={{
          overflow:'hidden',
          padding: "16px 26px",
        }}
      >
        <Outlet key={updateKey} />
      </div>
    </div>
  );
};

export default AppLayout;
