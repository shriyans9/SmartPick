import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";


// ========================================
// PROTECTED ROUTE
// ========================================

function ProtectedRoute({ children }) {

    const token = localStorage.getItem("smartpick_token");

    if (!token) {
        return <Navigate to="/login" replace />;
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
                    ROOT → LOGIN
                ================================= */}
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
                ================================= */}
                <Route
                    path="/login"
                    element={<Auth />}
                />


                {/* =================================
                    REGISTER
                ================================= */}
                <Route
                    path="/register"
                    element={<Auth />}
                />


                {/* =================================
                    DASHBOARD
                ================================= */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =================================
                    ANY UNKNOWN URL → LOGIN
                ================================= */}
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