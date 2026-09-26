import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";


// ========================================
// PROTECTED ROUTE
// ========================================

function ProtectedRoute({ children }) {

    const token = localStorage.getItem(
        "smartpick_token"
    );

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
}


// ========================================
// APP
// ========================================

function App() {

    return (
        <BrowserRouter>

            <Routes>

                {/* =================================
                    MAIN URL
                    https://smartpick-frontend-nt34.onrender.com
                    ↓
                    LOGIN
                ================================== */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />


                {/* =================================
                    LOGIN
                ================================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* =================================
                    REGISTER
                ================================== */}

                <Route
                    path="/register"
                    element={<Auth />}
                />


                {/* =================================
                    PROTECTED DASHBOARD
                ================================== */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =================================
                    UNKNOWN URL
                    SEND TO LOGIN
                ================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}


export default App;