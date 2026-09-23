import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import heroImage from "../src/assets/hero.png";

function Icon({ name, size = 20 }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    bag: (
      <>
        <path d="M5 8h14l1 12H4L5 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),

    monitor: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </>
    ),

    fitness: (
      <>
        <path d="M6 9v6" />
        <path d="M9 7v10" />
        <path d="M15 7v10" />
        <path d="M18 9v6" />
        <path d="M3 10v4" />
        <path d="M21 10v4" />
        <path d="M3 12h18" />
      </>
    ),

    home: (
      <>
        <path d="m3 11 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </>
    ),

    package: (
      <>
        <path d="m21 8-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </>
    ),

    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),

    check: (
      <path d="m5 12 4 4L19 6" />
    ),
  };

  return <svg {...props}>{paths[name]}</svg>;
}

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadProducts();
  }, [search, category]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getProducts(search, category);

      setProducts(data.products || []);
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (product) => {
  if (!product?.image) return "";

  const imagePath = String(product.image)
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `http://127.0.0.1:5000/static/${imagePath}`;
};

  const showToast = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2200);
  };

  const addToCart = async (product) => {
    try {
      if (product.stock <= 0) {
        showToast("This product is out of stock.");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:5000/api/products/${product.id}/decrease-stock`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!data.success) {
        showToast(data.message || "Could not add product.");
        return;
      }

      const cart =
        JSON.parse(localStorage.getItem("cart")) || [];

      const existingProduct = cart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        });
      }

      localStorage.setItem(
        "cart",
        JSON.stringify(cart)
      );

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          item.id === product.id
            ? { ...item, stock: data.stock }
            : item
        )
      );

      showToast(`${product.name} added to cart`);
    } catch (error) {
      console.error("Add to cart error:", error);
      showToast("Could not add product to cart.");
    }
  };

  const getCategoryIcon = (name) => {
    if (name === "Electronics") {
      return <Icon name="monitor" size={22} />;
    }

    if (name === "Fitness") {
      return <Icon name="fitness" size={22} />;
    }

    if (name === "Home") {
      return <Icon name="home" size={22} />;
    }

    return <Icon name="package" size={22} />;
  };

  return (
    <main className="premium-store">

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="premium-hero">

        <div className="hero-noise"></div>

        <div className="hero-inner">

          <div className="hero-left">

            <div className="hero-kicker">
              <span></span>
              CS TECH STORE
              <small>EST. 2026</small>
            </div>

            <h1>
              Technology
              <br />
              <span>built for</span>
              <strong>everyday.</strong>
            </h1>

            <p className="hero-description">
              Discover useful technology for study,
              work, fitness and everyday life.
            </p>

            <div className="premium-search">

              <Icon
                name="search"
                size={18}
              />

              <input
                type="text"
                value={search}
                placeholder="Search products..."
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <span>⌘ K</span>

            </div>

            <div className="hero-actions">

              <button
                onClick={() =>
                  document
                    .querySelector(".collection-section")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                Explore collection

                <Icon
                  name="arrow"
                  size={17}
                />
              </button>

              <div className="hero-stat">
                <strong>
                  {products.length}
                </strong>

                <span>
                  PRODUCTS
                </span>
              </div>

            </div>

          </div>


          {/* HERO IMAGE */}

          <div className="premium-hero-visual">

            <div className="visual-grid"></div>

            <div className="visual-glow"></div>

            <div className="visual-ring ring-one"></div>
            <div className="visual-ring ring-two"></div>

            <img
              src={heroImage}
              alt="CS Tech Store technology"
              className="main-hero-image"
            />

            <div className="visual-label label-top">
              <span className="status-dot"></span>
              SYSTEM ONLINE
            </div>

            <div className="visual-label label-bottom">
              <span>01</span>
              DIGITAL COLLECTION
            </div>

            <div className="floating-spec spec-one">
              <small>DESIGN</small>
              <strong>01</strong>
            </div>

            <div className="floating-spec spec-two">
              <small>STORE</small>
              <strong>CS / 26</strong>
            </div>

          </div>

        </div>


        <div className="hero-bottom-line">

          <span>SCROLL TO EXPLORE</span>

          <div></div>

          <span>THAILAND</span>

        </div>

      </section>


      {/* ==================================================
          CATEGORY
      ================================================== */}

      <section className="category-section-premium">

        <div className="section-heading-premium">

          <div>

            <span>
              01 / COLLECTION
            </span>

            <h2>
              Find your
              <br />
              category.
            </h2>

          </div>

          <p>
            Explore our products through
            simple, focused collections.
          </p>

        </div>


        <div className="category-grid-premium">

          <button
            className={
              category === "All"
                ? "premium-category active"
                : "premium-category"
            }
            onClick={() => setCategory("All")}
          >

            <span className="category-index">
              01
            </span>

            <div className="category-icon-premium">
              <Icon name="bag" size={24} />
            </div>

            <div className="category-content-premium">

              <small>
                COLLECTION
              </small>

              <strong>
                All Products
              </strong>

              <span>
                Everything in one place
              </span>

            </div>

            <div className="category-arrow-premium">
              <Icon name="arrow" size={18} />
            </div>

          </button>


          {categories.map((item, index) => (

            <button
              key={item}
              className={
                category === item
                  ? "premium-category active"
                  : "premium-category"
              }
              onClick={() =>
                setCategory(item)
              }
            >

              <span className="category-index">
                {String(index + 2).padStart(2, "0")}
              </span>

              <div className="category-icon-premium">
                {getCategoryIcon(item)}
              </div>

              <div className="category-content-premium">

                <small>
                  COLLECTION
                </small>

                <strong>
                  {item}
                </strong>

                <span>
                  Explore the collection
                </span>

              </div>

              <div className="category-arrow-premium">
                <Icon name="arrow" size={18} />
              </div>

            </button>

          ))}

        </div>

      </section>


      {/* ==================================================
          FEATURED
      ================================================== */}

      {products.length > 0 && (

        <section className="featured-section">

          <div className="featured-image">

            <div className="featured-orb"></div>

            <img
              src={getImageUrl(products[0])}
              alt={products[0].name}
            />

            <span className="featured-number">
              FEATURED / 01
            </span>

          </div>

          <div className="featured-content">

            <span className="featured-label">
              FEATURED PRODUCT
            </span>

            <h2>
              {products[0].name}
            </h2>

            <p>
              {products[0].description}
            </p>

            <div className="featured-meta">

              <div>
                <small>PRICE</small>

                <strong>
                  $
                  {Number(
                    products[0].price
                  ).toFixed(2)}
                </strong>
              </div>

              <div>
                <small>AVAILABILITY</small>

                <span>
                  <i></i>
                  {products[0].stock > 0
                    ? `${products[0].stock} in stock`
                    : "Sold out"}
                </span>
              </div>

            </div>

            <button
              className="featured-button"
              disabled={
                products[0].stock <= 0
              }
              onClick={() =>
                addToCart(products[0])
              }
            >

              {products[0].stock > 0
                ? "Add to cart"
                : "Sold out"}

              <Icon
                name="arrow"
                size={17}
              />

            </button>

          </div>

        </section>

      )}


      {/* ==================================================
          PRODUCTS
      ================================================== */}

      <section className="collection-section">

        <div className="collection-heading">

          <div>

            <span>
              02 / PRODUCTS
            </span>

            <h2>
              The collection.
            </h2>

          </div>

          <div className="collection-count">
            {products.length}
            <span> ITEMS</span>
          </div>

        </div>


        {loading ? (

          <div className="premium-loading">

            <div></div>

            <span>
              Loading collection...
            </span>

          </div>

        ) : products.length === 0 ? (

          <div className="premium-empty">

            <Icon
              name="package"
              size={42}
            />

            <h3>
              No products found
            </h3>

            <p>
              Try another search or category.
            </p>

          </div>

        ) : (

          <div className="premium-product-grid">

            {products.map((product, index) => (

              <article
                className="premium-product"
                key={product.id}
              >

                <div className="premium-product-image">

                  <span className="product-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="product-category">
                    {product.category}
                  </span>

                  <div className="product-glow"></div>

                  <img
                    src={getImageUrl(product)}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />

                  {product.stock <= 0 && (
                    <span className="product-sold">
                      SOLD OUT
                    </span>
                  )}

                </div>


                <div className="premium-product-info">

                  <h3>
                    {product.name}
                  </h3>

                  <p>
                    {product.description}
                  </p>

                  <div className="premium-product-bottom">

                    <div>

                      <small>
                        PRICE
                      </small>

                      <strong>
                        $
                        {Number(
                          product.price
                        ).toFixed(2)}
                      </strong>

                    </div>

                    <span
                      className={
                        product.stock > 0
                          ? "premium-stock"
                          : "premium-stock out"
                      }
                    >
                      <i></i>

                      {product.stock > 0
                        ? `${product.stock} available`
                        : "Unavailable"}

                    </span>

                  </div>


                  <button
                    className="premium-add"
                    disabled={
                      product.stock <= 0
                    }
                    onClick={() =>
                      addToCart(product)
                    }
                  >

                    <span>
                      {product.stock > 0
                        ? "Add to cart"
                        : "Sold out"}
                    </span>

                    <b>
                      <Icon
                        name={
                          product.stock > 0
                            ? "plus"
                            : "check"
                        }
                        size={16}
                      />
                    </b>

                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>


      {/* ==================================================
          FINAL CTA
      ================================================== */}

      <section className="final-premium">

        <div className="final-grid">

          <span className="final-index">
            03
          </span>

          <div>

            <span className="final-label">
              CS TECH STORE
            </span>

            <h2>
              Good technology
              <br />
              <strong>
                should feel simple.
              </strong>
            </h2>

            <p>
              Designed for students, creators,
              professionals and everyday life.
            </p>

            <button
              onClick={() =>
                document
                  .querySelector(
                    ".collection-section"
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Explore products
              <Icon
                name="arrow"
                size={17}
              />
            </button>

          </div>

          <div className="final-mark">

            <img
              src={heroImage}
              alt=""
            />

          </div>

        </div>

      </section>


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="premium-footer">

        <div>
          <strong>
            CS TECH STORE
          </strong>

          <span>
            Technology for everyday life.
          </span>
        </div>

        <div>
          React · Flask · MongoDB · 2026
        </div>

      </footer>


      {/* ==================================================
          TOAST
      ================================================== */}

      {toast && (

        <div className="premium-toast">

          <span>
            <Icon
              name="check"
              size={14}
            />
          </span>

          {toast}

        </div>

      )}

    </main>
  );
}

export default Home;