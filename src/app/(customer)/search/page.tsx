"use client";

import { useState, useMemo, useEffect, FC } from "react";
import { Search, X, Sprout, Compass } from "lucide-react";
import { useMenuQuery } from "@/lib/customer/use-menu-query";
import { useDebounce } from "@/lib/shared/use-debounce";
import { DishCard } from "@/components/customer/dish-card";
import styles from "./page.module.scss";

type TabType = "all" | "dishes" | "restaurants";

const SEARCH_PLACEHOLDERS = [
  "Aloo Paratha",
  "Maggi",
  "Crispy Corn",
  "Aloo poori",
];

const SearchPage: FC = () => {
  const { data } = useMenuQuery();
  const [query, setQuery] = useState<string>("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const debouncedQuery = useDebounce(query, 300);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isVegOnly, setIsVegOnly] = useState<boolean>(false);

  const totalPlaceholders = SEARCH_PLACEHOLDERS.length;

  // Rotate placeholder every 2.2 seconds safely
  useEffect(() => {
    if (totalPlaceholders <= 1) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % totalPlaceholders);
    }, 2200);
    return () => clearInterval(interval);
  }, [totalPlaceholders]);

  const currentPlaceholder =
    SEARCH_PLACEHOLDERS[placeholderIndex % totalPlaceholders] ||
    SEARCH_PLACEHOLDERS[0] ||
    "dishes";

  // Flatten all menu items
  const allDishes = useMemo(() => {
    return (data?.categories ?? []).flatMap((cat) => cat.items);
  }, [data?.categories]);

  const isQueryEmpty = debouncedQuery.trim() === "";

  // Filter dishes based on search query and dietary toggle
  const matchingDishes = useMemo(() => {
    const trimmed = debouncedQuery.trim().toLowerCase();

    return allDishes.filter((dish) => {
      // Veg Only filter
      if (isVegOnly && !dish.isVeg) return false;

      // When query is empty, return all dishes for exploration
      if (!trimmed) {
        return true;
      }

      // Query filter
      const inName = dish.name.toLowerCase().includes(trimmed);
      const inDesc = dish.description?.toLowerCase().includes(trimmed);
      return inName || inDesc;
    });
  }, [allDishes, debouncedQuery, isVegOnly]);

  const dishesCount = matchingDishes.length;
  const restaurantsCount = !isQueryEmpty ? (dishesCount > 0 ? 1 : 0) : 1;
  const allCount = dishesCount + (activeTab === "dishes" ? 0 : restaurantsCount);

  const handleClear = () => {
    setQuery("");
    setIsVegOnly(false);
    setActiveTab("all");
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Search Food</h1>
        <p className={styles.subtitle}>
          Find your favorite cravings and homemade dishes instantly
        </p>
      </header>

      {/* Primary Search Bar with Auto-Rotating Placeholder */}
      <div className={styles.searchBarWrapper}>
        <Search size={20} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder={`Search "${currentPlaceholder}" or dishes...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          aria-label="Search"
        />
        {query && (
          <button
            type="button"
            className={styles.clearIconBtn}
            onClick={() => setQuery("")}
            title="Clear text"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Tabs Bar */}
      <div className={styles.tabsBar}>
        <div className={styles.tabsLeft}>
          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === "all" ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab("all")}
          >
            <span>All</span>
            <span>({allCount})</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === "dishes" ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab("dishes")}
          >
            <span>Dishes</span>
            <span>({dishesCount})</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === "restaurants" ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab("restaurants")}
          >
            <span>Kitchen</span>
            <span>({restaurantsCount})</span>
          </button>
        </div>

        {/* Veg Only Toggle */}
        <button
          type="button"
          className={`${styles.vegToggleBtn} ${
            isVegOnly ? styles.vegToggleBtnActive : ""
          }`}
          onClick={() => setIsVegOnly(!isVegOnly)}
        >
          <span>Veg Only</span>
          <Sprout size={14} />
        </button>
      </div>

      {/* Main Results / Explore Area */}
      <main className={styles.resultsArea}>
        {isQueryEmpty ? (
          /* Empty Search String State: Show "Let's Explore" */
          <section aria-label="Explore Menu">
            <div className={styles.exploreHeader}>
              <h2 className={styles.exploreTitle}>Let&rsquo;s Explore</h2>
              <p className={styles.exploreSubtitle}>
                Discover our chef&rsquo;s signature dishes, handcrafted appetizers, and refreshing specialties.
              </p>
            </div>

            {matchingDishes.length === 0 ? (
              <div className={styles.emptyResultsCard}>
                <Compass size={48} className={styles.emptySearchIcon} />
                <h3 className={styles.emptyTitle}>Ready to explore?</h3>
                <p className={styles.emptySubtitle}>
                  {isVegOnly
                    ? "No vegetarian items currently available to explore."
                    : "Dishes added in the kitchen will show here ready to order."}
                </p>
              </div>
            ) : (
              <div className={styles.dishGrid}>
                {matchingDishes.map((item) => (
                  <DishCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        ) : matchingDishes.length === 0 ? (
          /* Query searched but no matches found: Show "No results found" */
          <div className={styles.emptyResultsCard}>
            <Search size={48} className={styles.emptySearchIcon} />
            <h3 className={styles.emptyTitle}>
              No results found for &ldquo;{debouncedQuery}&rdquo;
            </h3>
            <p className={styles.emptySubtitle}>
              Try checking for typos or searching with another keyword.
            </p>
            <button
              type="button"
              className={styles.clearFiltersBtn}
              onClick={handleClear}
            >
              Clear Search Filters
            </button>
          </div>
        ) : (
          /* Query searched and matches found: Show Search Results */
          <section aria-label="Search Results">
            <div className={styles.exploreHeader}>
              <h2 className={styles.exploreTitle}>
                Search Results ({matchingDishes.length})
              </h2>
              <p className={styles.exploreSubtitle}>
                Showing dishes matching &ldquo;{debouncedQuery}&rdquo;
              </p>
            </div>

            <div className={styles.dishGrid}>
              {matchingDishes.map((item) => (
                <DishCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
