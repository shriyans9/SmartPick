import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    searchProducts,
    getYouTubeReviews
} from "../services/api";
import "../App.css";
import {
    calculateSmartPickScores,
    getSmartPickRecommendation,
    getSmartPickAlternatives
} from "../utils/smartPick";

function Dashboard() {
    const navigate = useNavigate();

const [comparisonProducts, setComparisonProducts] =
    useState([]);

const [smartPickRecommendation, setSmartPickRecommendation] =
    useState(null);

const [smartPickAlternatives, setSmartPickAlternatives] =
    useState([]);

// =========================================
// CATEGORIES
// =========================================
    const categories = [

        {
            icon: "📱",
            title: "Phones",
            description: "Compare smartphones"
        },

        {
            icon: "💻",
            title: "Laptops",
            description: "Find your ideal laptop"
        },

        {
            icon: "🎧",
            title: "Audio",
            description: "Headphones & speakers"
        },

        {
            icon: "📷",
            title: "Cameras",
            description: "Compare camera gear"
        },

        {
            icon: "📺",
            title: "TVs",
            description: "Find the right display"
        },

        {
            icon: "⌚",
            title: "Wearables",
            description: "Smart watches & more"
        }

    ];

    // =========================================
    // USER
    // =========================================

    const storedUser =
        localStorage.getItem("smartpick_user");

    const user = storedUser
        ? JSON.parse(storedUser)
        : null;


    // =========================================
    // SEARCH
    // =========================================

    const [search, setSearch] = useState("");

    const [products, setProducts] = useState([]);

    const [searchLoading, setSearchLoading] =
        useState(false);

    const [searchError, setSearchError] =
        useState("");


    // =========================================
    // LOAD MORE
    // =========================================

    const [searchOffset, setSearchOffset] =
        useState(0);

    const [hasMoreProducts, setHasMoreProducts] =
        useState(true);

    const [loadingMore, setLoadingMore] =
        useState(false);


    // =========================================
    // COMPARE
    // =========================================

    const [compareProducts, setCompareProducts] =
        useState([]);
    

    // =========================================
    // SEARCH PRODUCTS
    // =========================================

    async function handleSearch(event) {

        event.preventDefault();

        const query = search.trim();

        if (!query) {
            return;
        }


        setSearchLoading(true);
        setSearchError("");

        setProducts([]);

        setSearchOffset(0);
        setHasMoreProducts(true);


        try {

            console.log(
                "Searching:",
                query
            );


            const result =
                await searchProducts(
                    query,
                    0
                );


            const newProducts =
                result.products || [];


            console.log(
                "Products received:",
                newProducts.length
            );


            setProducts(
                newProducts
            );
const comparisonData =
    calculateSmartPickScores(
        newProducts.slice(0, 5)
    );

const recommendation =
    getSmartPickRecommendation(
        comparisonData
    );

const alternatives =
    getSmartPickAlternatives(
        comparisonData,
        recommendation
    );

setComparisonProducts(
    comparisonData
);

setSmartPickRecommendation(
    recommendation
);

setSmartPickAlternatives(
    alternatives
);

            /*
             * Backend tells us whether
             * more products are available.
             *
             * If backend does not provide
             * has_more, we use the page size.
             */

            if (
                typeof result.has_more === "boolean"
            ) {

                setHasMoreProducts(
                    result.has_more
                );

            } else {

                setHasMoreProducts(
                    newProducts.length >= 200
                );

            }


        } catch (error) {

            console.error(
                "Search error:",
                error
            );


            setSearchError(
                error.message ||
                "Unable to search for products."
            );


            setProducts([]);

        } finally {

            setSearchLoading(false);

        }
    }


    // =========================================
    // LOAD MORE PRODUCTS
    // =========================================

    async function loadMoreProducts() {

        if (
            loadingMore ||
            !hasMoreProducts
        ) {
            return;
        }


        const query =
            search.trim();


        if (!query) {
            return;
        }


        setLoadingMore(true);


        try {

            const nextOffset =
                searchOffset + 200;


            console.log(
                "Loading more products..."
            );

            console.log(
                "Offset:",
                nextOffset
            );


            const result =
                await searchProducts(
                    query,
                    nextOffset
                );


            const newProducts =
                result.products || [];


            console.log(
                "New products:",
                newProducts.length
            );


            if (
                newProducts.length === 0
            ) {

                setHasMoreProducts(false);

                return;
            }


            // Add new products
            setProducts(
                previousProducts => [
                    ...previousProducts,
                    ...newProducts
                ]
            );


            // Update offset
            setSearchOffset(
                nextOffset
            );


            // Check backend result
            if (
                typeof result.has_more === "boolean"
            ) {

                setHasMoreProducts(
                    result.has_more
                );

            } else {

                setHasMoreProducts(
                    newProducts.length >= 200
                );

            }


        } catch (error) {

            console.error(
                "Load more error:",
                error
            );


            setSearchError(
                error.message ||
                "Unable to load more products."
            );

        } finally {

            setLoadingMore(false);

        }
    }


   // =========================================
// COMPARE PRODUCT
// =========================================

function handleCompare(product) {

    setCompareProducts((previousProducts) => {

        const alreadyAdded =
            previousProducts.some(
                (item) =>
                    item.product_id &&
                    item.product_id === product.product_id
            );

        if (alreadyAdded) {
            return previousProducts;
        }

        if (previousProducts.length >= 3) {

            alert(
                "You can compare up to 3 products."
            );

            return previousProducts;
        }

        const updatedProducts = [
            ...previousProducts,
            product
        ];

        // ------------------------------------
        // SMARTPICK ANALYSIS
        // ------------------------------------

        const scoredProducts =
            calculateSmartPickScores(
                updatedProducts
            );

        const recommendation =
            getSmartPickRecommendation(
                scoredProducts
            );

        const alternatives =
            getSmartPickAlternatives(
                scoredProducts,
                recommendation
            );

        setComparisonProducts(
            scoredProducts
        );

        setSmartPickRecommendation(
            recommendation
        );

        setSmartPickAlternatives(
            alternatives
        );

        return updatedProducts;
    });

    // ------------------------------------
    // Scroll to comparison
    // ------------------------------------

    setTimeout(() => {

        const comparisonSection =
            document.getElementById(
                "comparison-section"
            );

        if (comparisonSection) {

            comparisonSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }, 150);
}









    // =========================================
    // LOGOUT
    // =========================================

    function logout() {

        localStorage.removeItem(
            "smartpick_token"
        );

        localStorage.removeItem(
            "smartpick_user"
        );

        navigate("/login");

    }


    // =========================================
    // removeCompareProduct
    // =========================================
  
function removeCompareProduct(index) {

    setCompareProducts((previousProducts) => {

        const updatedProducts =
            previousProducts.filter(
                (_, productIndex) =>
                    productIndex !== index
            );

        const scoredProducts =
            calculateSmartPickScores(
                updatedProducts
            );

        const recommendation =
            getSmartPickRecommendation(
                scoredProducts
            );

        const alternatives =
            getSmartPickAlternatives(
                scoredProducts,
                recommendation
            );

        setComparisonProducts(
            scoredProducts
        );

        setSmartPickRecommendation(
            recommendation
        );

        setSmartPickAlternatives(
            alternatives
        );

        return updatedProducts;
    });
}
// =========================================
// CLEAR ALL COMPARISON
// =========================================

function clearComparison() {

    setCompareProducts([]);

    setComparisonProducts([]);

    setSmartPickRecommendation(null);

    setSmartPickAlternatives([]);

}
// =========================================
// COMPARISON ANALYSIS
// =========================================

function getPriceNumber(price) {
    if (!price) return null;

    const number = parseFloat(
        String(price).replace(/[^0-9.]/g, "")
    );

    return isNaN(number) ? null : number;
}


function getComparisonInsight(product) {

    const title = String(product.title || "").toLowerCase();

    const rating = product.rating
        ? parseFloat(product.rating)
        : null;

    const reviews = product.reviews
        ? parseInt(
            String(product.reviews).replace(/[^0-9]/g, "")
        )
        : null;

    const insights = [];


    /* -----------------------------
       PRODUCT TYPE / USE CASE
    ----------------------------- */

    if (
        title.includes("laptop") ||
        title.includes("notebook") ||
        title.includes("macbook")
    ) {

        insights.push(
            "A practical choice if you need a computer for everyday work, study, browsing, or multitasking."
        );

    } else if (
        title.includes("phone") ||
        title.includes("iphone") ||
        title.includes("pixel") ||
        title.includes("galaxy")
    ) {

        insights.push(
            "A useful option if you want a smartphone for everyday communication, apps, entertainment, and mobile use."
        );

    } else if (
        title.includes("headphone") ||
        title.includes("earbud") ||
        title.includes("earphone")
    ) {

        insights.push(
            "Worth considering if you spend a lot of time listening to music, watching content, or taking calls."
        );

    } else if (
        title.includes("monitor") ||
        title.includes("display")
    ) {

        insights.push(
            "A practical option if you need more screen space for work, study, gaming, or multitasking."
        );

    } else if (
        title.includes("camera")
    ) {

        insights.push(
            "Could suit users who want a dedicated device for photography or video capture."
        );

    } else {

        insights.push(
            "This option may be useful depending on the features and specifications that matter most to you."
        );

    }


    /* -----------------------------
       CUSTOMER FEEDBACK
    ----------------------------- */

    if (rating !== null && rating >= 4.5) {

        insights.push(
            `It currently has a strong customer rating of ${rating}/5.` 
        );

    } else if (rating !== null && rating >= 4.0) {

        insights.push(
            `Customers currently rate it ${rating}/5.`
        );

    }


    /* -----------------------------
       REVIEW VOLUME
    ----------------------------- */

    if (reviews !== null && reviews > 0) {

        if (reviews >= 1000) {

            insights.push(
                `There is a large amount of customer feedback available (${reviews.toLocaleString()} reviews).`
            );

        } else if (reviews >= 100) {

            insights.push(
                `There is useful customer feedback available from ${reviews.toLocaleString()} reviews.`
            );

        }

    }


    return insights.join(" ");
}
function formatComparisonPriceDifference(difference) {

    if (difference <= 0) {
        return "the same amount";
    }

    if (difference < 1) {
        return `₹${difference.toFixed(2)}`;
    }

    return `₹${difference.toFixed(2)}`;
}

// =========================================
// COMPARE SUMMARY
// =========================================

function getComparisonSummary() {

    if (compareProducts.length < 2) {
        return null;
    }

    const productsWithPrices =
        compareProducts
            .map(product => ({
                product,
                price: getPriceNumber(product.price)
            }))
            .filter(item => item.price !== null);

    const productsWithRatings =
        compareProducts
            .map(product => ({
                product,
                rating: product.rating
                    ? parseFloat(product.rating)
                    : null
            }))
            .filter(item => item.rating !== null);

    const cheapest =
        productsWithPrices.length > 0
            ? productsWithPrices.reduce(
                (lowest, current) =>
                    current.price < lowest.price
                        ? current
                        : lowest
            )
            : null;

    const highestRated =
        productsWithRatings.length > 0
            ? productsWithRatings.reduce(
                (highest, current) =>
                    current.rating > highest.rating
                        ? current
                        : highest
            )
            : null;

    return {
        cheapest,
        highestRated
    };
}


// =========================================
// COMPARISON SUMMARY
// =========================================

const comparisonSummary =
    getComparisonSummary();

return (

        <div className="dashboard">


            {/* =================================
                BACKGROUND
            ================================= */}

            <div className="dashboard-orb orb-one"></div>

            <div className="dashboard-orb orb-two"></div>

            <div className="dashboard-orb orb-three"></div>

            {/* =================================
    NAVBAR
================================= */}

<header className="dashboard-navbar">

    {/* SMARTPICK LOGO */}
    <div
        className="dashboard-logo"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
    >

        <div className="dashboard-logo-mark">
            S
        </div>

        <span>
            SmartPick
        </span>

    </div>


    {/* NAVIGATION */}
    <nav className="dashboard-nav">

        {/* DISCOVER */}
        <button
            type="button"
            onClick={() => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }}
        >
            Discover
        </button>


        {/* COMPARE */}
        <button
            type="button"
            onClick={() => {

                const comparisonSection =
                    document.getElementById(
                        "comparison-section"
                    );

                if (comparisonSection) {

                    comparisonSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }}
        >
            Compare
        </button>

    </nav>


    {/* USER */}
    <div className="dashboard-user">

        {/* USER AVATAR */}
        <div className="user-avatar">

            {user?.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "U"}

        </div>


        {/* USER INFORMATION */}
        <div className="user-info">

            <strong>
                {user?.name || "User"}
            </strong>

            <span>
                SmartPick member
            </span>

        </div>


        {/* LOGOUT */}
        <button
            type="button"
            className="logout-button"
            onClick={logout}
        >
            Logout
        </button>

    </div>

</header>


{/* =================================
    MAIN
================================= */}



          

            <main className="dashboard-content">


                {/* =================================
                    HERO
                ================================= */}

                <section className="hero-section">

                    <div className="hero-text">

                        <div className="hero-badge">
                            ✦ AI-POWERED PRODUCT INTELLIGENCE
                        </div>


                        <h1>

                            Find the right

                            <span>
                                product for you.
                            </span>

                        </h1>


                        <p>
                            Search naturally. Compare intelligently.
                            Understand the trade-offs before you buy.
                        </p>

                    </div>


                    <div className="hero-visual">

                        <div className="floating-ring ring-one"></div>

                        <div className="floating-ring ring-two"></div>


                        <div className="product-orbit">

                            <div className="orbit-card card-phone">
                                📱
                            </div>

                            <div className="orbit-card card-laptop">
                                💻
                            </div>

                            <div className="orbit-card card-headphone">
                                🎧
                            </div>


                            <div className="core-card">

                                <div className="core-logo">
                                    S
                                </div>

                                <span>
                                    SMART
                                </span>

                                <strong>
                                    PICK
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================
                    SEARCH
                ================================= */}

                <section className="smart-search-section">

                    <div className="search-label">

                        <span>
                            01
                        </span>

                        Tell SmartPick what you need

                    </div>


                    <form
                        className="smart-search"
                        onSubmit={handleSearch}
                    >

                        <div className="search-icon">
                            🔍
                        </div>


                        <input
                            type="text"
                            value={search}
                            onChange={event =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Example: Best headphones under ₹5,000 with ANC..."
                        />


                        <button
                            type="submit"
                            disabled={searchLoading}
                        >

                            {searchLoading
                                ? "Searching..."
                                : "Analyze"}

                            {!searchLoading && (
                                <span>
                                    →
                                </span>
                            )}

                        </button>

                    </form>


                    {/* =================================
    QUICK SEARCH PRODUCTS
================================= */}

<div className="quick-search-section">

    <div className="quick-search-title">
        Try searching for
    </div>

    <div className="quick-search-grid">

        <button
            type="button"
            className="quick-search-card"
            onClick={() => {
                setSearch("Best phones");
                handleSearch();
            }}
        >
            <div className="quick-search-icon">📱</div>

            <div className="quick-search-content">
                <h4>Best Phones</h4>
                <p>Compare phones by price, features and value.</p>
            </div>

            <span className="quick-search-arrow">→</span>
        </button>


        <button
            type="button"
            className="quick-search-card"
            onClick={() => {
                setSearch("Best laptops for coding");
                handleSearch();
            }}
        >
            <div className="quick-search-icon">💻</div>

            <div className="quick-search-content">
                <h4>Laptops for Coding</h4>
                <p>Find laptops suitable for programming and development.</p>
            </div>

            <span className="quick-search-arrow">→</span>
        </button>


        <button
            type="button"
            className="quick-search-card"
            onClick={() => {
                setSearch("Best headphones with ANC");
                handleSearch();
            }}
        >
            <div className="quick-search-icon">🎧</div>

            <div className="quick-search-content">
                <h4>Headphones</h4>
                <p>Compare sound quality, ANC, price and reviews.</p>
            </div>

            <span className="quick-search-arrow">→</span>
        </button>


        <button
            type="button"
            className="quick-search-card"
            onClick={() => {
                setSearch("Best smartwatches");
                handleSearch();
            }}
        >
            <div className="quick-search-icon">⌚</div>

            <div className="quick-search-content">
                <h4>Smartwatches</h4>
                <p>Explore popular smartwatches across different prices.</p>
            </div>

            <span className="quick-search-arrow">→</span>
        </button>


        <button
            type="button"
            className="quick-search-card"
            onClick={() => {
                setSearch("Best gaming monitors");
                handleSearch();
            }}
        >
            <div className="quick-search-icon">🖥️</div>

            <div className="quick-search-content">
                <h4>Gaming Monitors</h4>
                <p>Compare gaming displays, refresh rates and prices.</p>
            </div>

            <span className="quick-search-arrow">→</span>
        </button>


        <button
            type="button"
            className="quick-search-card"
            onClick={() => {
                setSearch("Best cameras");
                handleSearch();
            }}
        >
            <div className="quick-search-icon">📷</div>

            <div className="quick-search-content">
                <h4>Cameras</h4>
                <p>Compare cameras based on features, price and reviews.</p>
            </div>

            <span className="quick-search-arrow">→</span>
        </button>

    </div>

</div>

                </section>


                {/* =================================
                    SEARCH ERROR
                ================================= */}

                {searchError && (

                    <section className="product-results-section">

                        <div className="product-results-heading">

                            <div>

                                <span className="section-number">
                                    !
                                </span>

                                <h2>
                                    Search failed
                                </h2>

                            </div>

                        </div>


                        <div className="product-search-error">

                            {searchError}

                        </div>

                    </section>

                )}


                {/* =================================
                    PRODUCTS
                ================================= */}

                {!searchLoading &&
                !searchError &&
                products.length > 0 && (

                    <section className="product-results-section">

                        <div className="product-results-heading">

                            <div>

                                <span className="section-number">
                                    02
                                </span>

                                <h2>
                                    Products found
                                </h2>

                            </div>


                            <span>
                                {products.length} results
                            </span>

                        </div>


                        <div className="product-grid">

                            {products.map(
                                (product, index) => {

                                    const isCompared =
                                        compareProducts.some(
                                            item =>
                                                item.product_id &&
                                                item.product_id ===
                                                product.product_id
                                        );


                                    return (

                                        <article
                                            className="product-card"
                                            key={
                                                `${product.product_id || product.title}-${index}`
                                            }
                                        >


                                            {/* IMAGE */}

                                            <div className="product-image-container">

                                                {product.thumbnail ? (

                                                    <img
                                                        src={
                                                            product.thumbnail
                                                        }
                                                        alt={
                                                            product.title
                                                        }
                                                        className="product-image"
                                                    />

                                                ) : (

                                                    <div className="product-image-placeholder">
                                                        No image
                                                    </div>

                                                )}

                                            </div>


                                            {/* CONTENT */}

                                            <div className="product-card-content">


                                                <span className="product-source">
                                                    {product.source ||
                                                        "Shopping source"}
                                                </span>


                                                <h3>
                                                    {product.title}
                                                </h3>


                                                {product.price && (

                                                    <div className="product-price">
                                                        {product.price}
                                                    </div>

                                                )}
                                            {/* =========================================
    YOUTUBE REVIEWS
========================================= */}

{product.youtube_reviews &&
    product.youtube_reviews.length > 0 && (

    <div className="youtube-reviews-card">

        {/* Header */}
        <div className="youtube-reviews-header">

            <div className="youtube-icon">
                ▶
            </div>

            <div>
                <h4>YouTube Reviews</h4>

                <p>
                    Watch video reviews before you decide
                </p>
            </div>

        </div>


        {/* Content */}
        <div className="youtube-reviews-content">

            <div className="youtube-preview-icon">
                ▶
            </div>

            <div className="youtube-preview-text">

                <strong>
                    {product.title || product.name}
                </strong>

                <span>
                    Find reviews, comparisons and hands-on videos
                    on YouTube.
                </span>

            </div>

        </div>


        {/* Button */}
        {product.youtube_reviews[0]?.url && (

            <a
                href={product.youtube_reviews[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="youtube-watch-button"
            >

                <span className="youtube-play">
                    ▶
                </span>

                Watch Reviews on YouTube

                <span className="youtube-arrow">
                    ↗
                </span>

            </a>

        )}

    </div>

)}

                                                <div className="product-meta">

                                                    {product.rating && (

                                                        <span>
                                                            ⭐ {product.rating}
                                                        </span>

                                                    )}


                                                    {product.reviews && (

                                                        <span>
                                                            {product.reviews}
                                                            {" "}
                                                            reviews
                                                        </span>

                                                    )}

                                                </div>


                                                {product.delivery && (

                                                    <p className="product-delivery">
                                                        {product.delivery}
                                                    </p>

                                                )}


                                                {/* VIEW PRODUCT */}

                                                {product.product_link && (

                                                    <a
                                                        href={
                                                            product.product_link
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="product-view-button"
                                                    >
                                                        View product →
                                                    </a>

                                                )}


                                                {/* COMPARE */}

                                                <button
                                                    type="button"
                                                    className={
                                                        isCompared
                                                            ? "product-compare-button added"
                                                            : "product-compare-button"
                                                    }
                                                    onClick={() =>
                                                        handleCompare(
                                                            product
                                                        )
                                                    }
                                                >

                                                    {isCompared
                                                        ? "✓ Added"
                                                        : "+ Compare"}

                                                </button>

                                            </div>

                                        </article>

                                    );

                                }
                            )}

                        </div>


                        {/* LOAD MORE */}

                        {hasMoreProducts && (

                            <div className="load-more-container">

                                <button
                                    type="button"
                                    onClick={
                                        loadMoreProducts
                                    }
                                    disabled={
                                        loadingMore
                                    }
                                >

                                    {loadingMore
                                        ? "Loading..."
                                        : "Load More Products"}

                                </button>

                            </div>

                        )}

                    </section>

                )}


                {compareProducts.length > 0 && (
    <section
        id="comparison-section"
        className="comparison-section"
    >

        {/* ================================
            SECTION HEADING
        ================================= */}

        <div className="section-heading">

            <div>

                <span className="section-number">
                    03
                </span>

                <h2>
                    Compare Products
                </h2>

            </div>

            <div>

                <span>
                    {compareProducts.length}/3 selected
                </span>

                <button
                    type="button"
                    onClick={clearComparison}
                >
                    Clear all
                </button>

            </div>

        </div>




        {/* ================================
            COMPARISON CARDS
        ================================= */}

        <div className="comparison-grid">

            {compareProducts.map((product, index) => (

                <div
                    className="comparison-card"
                    key={
                        `${product.product_id || product.title}-${index}`
                    }
                >

                    {product.thumbnail && (
                        <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="comparison-image"
                        />
                    )}

                    <h3>
                        {product.title}
                    </h3>

                    <p className="comparison-price">
                        {product.price || "Price unavailable"}
                    </p>

                    <p>
                        <strong>Source:</strong>{" "}
                        {product.source || "Online Store"}
                    </p>

                    {product.rating && (
                        <p>
                            ⭐ {product.rating}
                        </p>
                    )}

                    {product.product_link && (
                        <a
                            href={product.product_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="product-view-button"
                        >
                            View Product →
                        </a>
                    )}

                    <button
                        type="button"
                        className="remove-compare-button"
                        onClick={() =>
                            removeCompareProduct(index)
                        }
                    >
                        Remove
                    </button>

                </div>

            ))}

        </div>


        {/* ================================
            COMPARISON TABLE
        ================================= */}

        <div className="comparison-table-container">

            <h3 className="comparison-table-title">
                Quick Comparison
            </h3>

            <div className="comparison-table">

                {/* HEADER */}

                <div className="comparison-row comparison-header">

                    <div className="comparison-label">
                        Feature
                    </div>

                    {compareProducts.map((product, index) => (

                        <div
                            className="comparison-product-name"
                            key={
                                `header-${product.product_id || product.title}-${index}`
                            }
                        >
                            {product.title}
                        </div>

                    ))}

                </div>


                {/* PRICE */}

                <div className="comparison-row">

                    <div className="comparison-label">
                        Price
                    </div>

                    {compareProducts.map((product, index) => (

                        <div
                            className="comparison-value comparison-price-value"
                            key={`price-${index}`}
                        >
                            {product.price || "Unavailable"}
                        </div>

                    ))}

                </div>

            
                {/* SOURCE */}

                <div className="comparison-row">

                    <div className="comparison-label">
                        Source
                    </div>

                    {compareProducts.map((product, index) => (

                        <div
                            className="comparison-value"
                            key={`source-${index}`}
                        >
                            {product.source || "Unavailable"}
                        </div>

                    ))}

                </div>


                {/* RATING */}

                <div className="comparison-row">

                    <div className="comparison-label">
                        Rating
                    </div>

                    {compareProducts.map((product, index) => (

                        <div
                            className="comparison-value"
                            key={`rating-${index}`}
                        >
                            {product.rating
                                ? `⭐ ${product.rating}`
                                : "Not available"}
                        </div>

                    ))}

                </div>


                {/* REVIEWS */}

                <div className="comparison-row">

                    <div className="comparison-label">
                        Reviews
                    </div>

                    {compareProducts.map((product, index) => (

                        <div
                            className="comparison-value"
                            key={`reviews-${index}`}
                        >
                            {product.reviews || "Not available"}
                        </div>

                    ))}

                </div>


                {/* DELIVERY */}

                <div className="comparison-row">

                    <div className="comparison-label">
                        Delivery
                    </div>

                    {compareProducts.map((product, index) => (

                        <div
                            className="comparison-value"
                            key={`delivery-${index}`}
                        >
                            {product.delivery || "Not available"}
                        </div>

                    ))}

                </div>

            </div>

        </div>



        {/* =================================
    SMARTPICK PRODUCT GUIDANCE
================================= */}

<div className="smartpick-guidance">

    <div className="guidance-header">
        <div>
            <span className="guidance-eyebrow">
                SMARTPICK INSIGHT
            </span>

            <h3>
                Which one fits your needs?
            </h3>

            <p>
                Here’s how each option could fit into your everyday use,
                based on the product information available.
            </p>
        </div>
    </div>


    <div className="guidance-grid">

        {compareProducts.map((product, index) => (

            <div
                className="guidance-card"
                key={`guidance-${product.product_id || product.title}-${index}`}
            >

                {/* NUMBER */}

                <div className="guidance-number">
                    {String(index + 1).padStart(2, "0")}
                </div>


                {/* PRODUCT NAME */}

                <h4>
                    {product.title}
                </h4>


                {/* HUMAN STYLE INSIGHT */}

                <div className="guidance-message">

                    <span className="guidance-icon">
                        ✦
                    </span>

                    <p>
                        {getComparisonInsight(product)}
                    </p>

                </div>


                {/* USEFUL INFORMATION */}

                <div className="guidance-facts">

                    {product.rating && (
                        <div className="guidance-fact">
                            <span>⭐</span>
                            <div>
                                <strong>
                                    {product.rating}
                                </strong>
                                <small>
                                    Customer rating
                                </small>
                            </div>
                        </div>
                    )}


                    {product.reviews && (
                        <div className="guidance-fact">
                            <span>💬</span>
                            <div>
                                <strong>
                                    {product.reviews}
                                </strong>
                                <small>
                                    Customer reviews
                                </small>
                            </div>
                        </div>
                    )}


                    {product.delivery && (
                        <div className="guidance-fact">
                            <span>🚚</span>
                            <div>
                                <strong>
                                    Delivery
                                </strong>
                                <small>
                                    {product.delivery}
                                </small>
                            </div>
                        </div>
                    )}

                </div>


                {/* CTA */}

                {product.product_link && (

                    <a
                        href={product.product_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="guidance-button"
                    >
                        Explore this product
                        <span>→</span>
                    </a>

                )}

            </div>

        ))}

    </div>

</div>

    </section>
)}


                {/* =================================
    HOW SMARTPICK WORKS
================================= */}

<section className="intelligence-section">

    <div className="intelligence-heading">

        <span className="section-number">
            05
        </span>

        <h2>
            Shopping, but smarter.
        </h2>

        <p>
            SmartPick is designed to help you
            understand a decision, not simply
            show you products.
        </p>

    </div>


    <div className="intelligence-cards">


        {/* =================================
            DISCOVER
        ================================= */}

        <button
            type="button"
            className="intelligence-card"
            onClick={() => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }}
        >

            <span className="step-number">
                01
            </span>

            <div className="intelligence-icon">
                🔎
            </div>

            <h3>
                Discover
            </h3>

            <p>
                Search using natural language
                instead of complicated filters.
            </p>

        </button>


        {/* =================================
            UNDERSTAND
        ================================= */}

        <button
            type="button"
            className="intelligence-card featured"
            onClick={() => {

                const comparisonSection =
                    document.getElementById(
                        "comparison-section"
                    );

                if (comparisonSection) {

                    comparisonSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }}
        >

            <span className="step-number">
                02
            </span>

            <div className="intelligence-icon">
                🧠
            </div>

            <h3>
                Understand
            </h3>

            <p>
                See features, differences,
                evidence and trade-offs.
            </p>

        </button>


        {/* =================================
            DECIDE
        ================================= */}

        <button
            type="button"
            className="intelligence-card"
            onClick={() => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }}
        >

            <span className="step-number">
                03
            </span>

            <div className="intelligence-icon">
                ✦
            </div>

            <h3>
                Decide
            </h3>

            <p>
                Get an explanation tailored
                to what matters to you.
            </p>

        </button>


    </div>

</section>


{/* =================================
    FOOTER
================================= */}

                <footer className="dashboard-footer">

                    <div className="dashboard-logo">

                        <div className="dashboard-logo-mark">
                            S
                        </div>

                        <span>
                            SmartPick
                        </span>

                    </div>


                    <p>
                        Search smarter. Understand better.
                        Choose confidently.
                    </p>

                </footer>


            </main>

        </div>

    );

}


export default Dashboard;