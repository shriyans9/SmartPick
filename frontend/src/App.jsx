import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";


function ProtectedRoute({ children }) {

    const token = localStorage.getItem(
        "smartpick_token"
    );

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}


function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />


                <Route
                    path="/login"
                    element={<Auth />}
                />


                <Route
                    path="/register"
                    element={<Auth />}
                />


                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}


export default App;