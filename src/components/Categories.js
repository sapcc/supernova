import React from "react"
import { useDispatch } from "../lib/globalState"
import CategorySeverityBadges from "./shared/SeverityBadges"

const Categories = ({ categories, counts }) => {
  const dispatch = useDispatch()

  const handleCategoryChange = (category) => {
    // reset all dependent filters
    if (!category.active && category.area === "landscape") {
      Object.keys(category.match_re).forEach((key) =>
        dispatch({ type: "SET_VALUES_FOR_FILTER", name: key, values: [] })
      )
    }

    dispatch({
      type: "SET_ACTIVE_CATEGORY",
      name: category.name,
      active: !category.active,
    })
  }

  const categoriesByArea = React.useMemo(() => {
    if (categories.isLoading) return
    return categories.items.reduce((map, c) => {
      map[c.area] = map[c.area] || []
      map[c.area].push(c)
      return map
    }, {})
  }, [categories])

  if (categories.isLoading) return <span>Loading...</span>

  return (
    <ul className="sidebar-dropdown">
      {Object.keys(categoriesByArea).map((area, i) => (
        <li key={i}>
          <span className="sidebar-item head">{area}</span>

          <ul>
            {categoriesByArea[area].map((category, index) => (
              <li className="sidebar-item" key={index}>
                <span
                  className={`sidebar-link u-display-flex ${
                    category.active === true ? "active" : ""
                  }`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category.name}{" "}
                  {counts && counts[category.name] && (
                    <CategorySeverityBadges
                      {...counts[category.name].summary}
                    />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}

export default Categories
