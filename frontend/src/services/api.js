const API_BASE_URL = "https://smartpick-2x64.onrender.com/api";


// --------------------------------
// Common API Request
// --------------------------------

async function apiRequest(endpoint, options = {}) {

    try {

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },
                ...options
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Something went wrong"
            );

        }


        return data;

    } catch (error) {

        console.error(
            "API REQUEST ERROR:",
            error
        );

        throw error;

    }

}


// --------------------------------
// Register
// --------------------------------

export async function registerUser(userData) {

    return apiRequest(
        "/auth/register",
        {
            method: "POST",

            body: JSON.stringify(userData)
        }
    );

}


// --------------------------------
// Login
// --------------------------------

export async function loginUser(credentials) {

    return apiRequest(
        "/auth/login",
        {
            method: "POST",

            body: JSON.stringify(credentials)
        }
    );

}


// --------------------------------
// Backend Health
// --------------------------------

export async function checkBackendHealth() {

    return apiRequest(
        "/health"
    );

}


// --------------------------------
// Product Search
// --------------------------------

export async function searchProducts(
    query,
    offset = 0
) {

    return apiRequest(
        `/products/search?q=${encodeURIComponent(query)}&offset=${offset}`
    );

}
// --------------------------------
// YouTube Review Link
// --------------------------------

export async function getYoutubeReviews(productName) {

    return apiRequest(
        `/youtube/reviews?product_name=${encodeURIComponent(productName)}`
    );

}

// --------------------------------
// YouTube Reviews
// --------------------------------

export async function getYouTubeReviews(
    productName
) {

    if (!productName || !productName.trim()) {

        return [];

    }


    try {

        const data = await apiRequest(

            `/youtube/reviews?product_name=${encodeURIComponent(
                productName
            )}`

        );


        return data.youtube_reviews || [];

    } catch (error) {

        console.error(

            `YOUTUBE API ERROR for "${productName}":`,

            error

        );


        return [];

    }

}