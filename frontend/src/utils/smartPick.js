// ============================================
// SmartPick Comparison Engine
// ============================================

function toNumber(value) {
    if (value === null || value === undefined) {
        return null;
    }

    const number = Number(
        String(value).replace(/[^0-9.]/g, "")
    );

    return Number.isFinite(number) ? number : null;
}


// --------------------------------------------
// Calculate price score
// Lower price = better value
// --------------------------------------------

function calculatePriceScore(products) {

    const prices = products
        .map(product => toNumber(product.price))
        .filter(price => price !== null && price > 0);

    if (prices.length === 0) {
        return products.map(() => null);
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return products.map(product => {

        const price = toNumber(product.price);

        if (price === null || price <= 0) {
            return null;
        }

        if (minPrice === maxPrice) {
            return 100;
        }

        return Math.round(
            100 -
            ((price - minPrice) /
                (maxPrice - minPrice)) * 100
        );
    });
}


// --------------------------------------------
// Calculate rating score
// --------------------------------------------

function calculateRatingScore(product) {

    const rating = toNumber(product.rating);

    if (
        rating === null ||
        rating <= 0 ||
        rating > 5
    ) {
        return null;
    }

    return Math.round(
        (rating / 5) * 100
    );
}


// --------------------------------------------
// Calculate review score
// Uses logarithmic scaling so
// 10,000 reviews doesn't dominate everything.
// --------------------------------------------

function calculateReviewScore(product) {

    const reviews = toNumber(product.reviews);

    if (
        reviews === null ||
        reviews < 0
    ) {
        return null;
    }

    if (reviews === 0) {
        return 0;
    }

    const score =
        Math.log10(reviews + 1) /
        Math.log10(10001);

    return Math.min(
        100,
        Math.round(score * 100)
    );
}


// --------------------------------------------
// Create SmartPick score
// --------------------------------------------

export function calculateSmartPickScores(products) {

    if (!products || products.length === 0) {
        return [];
    }

    const priceScores =
        calculatePriceScore(products);

    return products.map((product, index) => {

        const factors = [];

        // Price
        if (priceScores[index] !== null) {

            factors.push({
                name: "Price",
                score: priceScores[index],
                weight: 50
            });

        }

        // Rating
        const ratingScore =
            calculateRatingScore(product);

        if (ratingScore !== null) {

            factors.push({
                name: "Rating",
                score: ratingScore,
                weight: 30
            });

        }

        // Reviews
        const reviewScore =
            calculateReviewScore(product);

        if (reviewScore !== null) {

            factors.push({
                name: "Reviews",
                score: reviewScore,
                weight: 20
            });

        }

        // ------------------------------------
        // Calculate weighted score
        // only using available information
        // ------------------------------------

        if (factors.length === 0) {

            return {
                ...product,
                smartPickScore: null,
                factors: [],
                recommendationReason:
                    "Not enough comparison data available."
            };

        }

        const totalWeight =
            factors.reduce(
                (sum, factor) =>
                    sum + factor.weight,
                0
            );

        const weightedScore =
            factors.reduce(
                (sum, factor) =>
                    sum +
                    factor.score *
                    factor.weight,
                0
            ) / totalWeight;

        const score =
            Math.round(weightedScore);

        // ------------------------------------
        // Generate explanation
        // ------------------------------------

        const reasons = [];

        const priceFactor =
            factors.find(
                factor =>
                    factor.name === "Price"
            );

        const ratingFactor =
            factors.find(
                factor =>
                    factor.name === "Rating"
            );

        const reviewFactor =
            factors.find(
                factor =>
                    factor.name === "Reviews"
            );

        if (
            priceFactor &&
            priceFactor.score >= 80
        ) {
            reasons.push(
                "Competitive price"
            );
        }

        if (
            ratingFactor &&
            ratingFactor.score >= 80
        ) {
            reasons.push(
                "Strong customer rating"
            );
        }

        if (
            reviewFactor &&
            reviewFactor.score >= 70
        ) {
            reasons.push(
                "Good review volume"
            );
        }

        if (reasons.length === 0) {
            reasons.push(
                "Comparison based on available product data"
            );
        }

        return {
            ...product,

            smartPickScore: score,

            factors,

            recommendationReason:
                reasons.join(" • ")
        };
    });
}


// --------------------------------------------
// Get recommended product
// --------------------------------------------

export function getSmartPickRecommendation(products) {

    const scoredProducts =
        calculateSmartPickScores(products);

    const validProducts =
        scoredProducts.filter(
            product =>
                product.smartPickScore !== null
        );

    if (validProducts.length === 0) {
        return null;
    }

    return [...validProducts].sort(
        (a, b) =>
            b.smartPickScore -
            a.smartPickScore
    )[0];
}


// --------------------------------------------
// Get alternative products
// --------------------------------------------

export function getSmartPickAlternatives(
    products,
    recommendation
) {

    if (!recommendation) {
        return [];
    }

    return products
        .filter(
            product =>
                product.product_id !==
                recommendation.product_id
        )
        .sort(
            (a, b) =>
                (b.smartPickScore || 0) -
                (a.smartPickScore || 0)
        )
        .slice(0, 2);
}