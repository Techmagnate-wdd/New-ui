import React, { useContext, useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import AuthContext from "../context/AuthContext";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import WriteSonicDashboard from "../pages/LLM/WriteSonicDashboard";
import { useLLM } from "../context/LLMContext";
import { useFilter } from "../context/SerpFilterContext";
import FilterComponent from "../pages/SerpFeatures/FilterComponent";
import { getProjects } from "../services/api";
import SerpFilterComponent from "../pages/SerpFeatures/SerpFilterComponent";

const MasterLayout = ({ children }) => {
  let [sidebarActive, setSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  let [desktopMenu, setDesktopMenu] = useState(false);
  const { logout, user } = useContext(AuthContext);
  const [theme, setTheme] = useState("light");
  const access = new Set(user?.access || []);
  const isAdmin = user?.role === "admin";
  const { totalAnswers, llmProjectId, promptsSelectedDate } = useLLM();
  const navigate = useNavigate()
  const location = useLocation();
  const { filter, setFilter } = useFilter();
  const [selectedProjectData, setSelectedProjectData] = useState([]);
  // useEffect(() => {
  let writesonicStyle = location.pathname.startsWith("/llm-dashboard") ? "" : "dashboard-main-body"
  // }, [location])

  useEffect(() => {
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px"; // Collapse submenu
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
        }
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
        submenuLinks.forEach((link) => {
          if (
            link.getAttribute("href") === location.pathname ||
            link.getAttribute("to") === location.pathname
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) {
              submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
            }
          }
        });
      });
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);

  let sidebarControl = () => {
    setSidebarActive(!sidebarActive);
    setDesktopMenu(!desktopMenu);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  const isCollapsed = !sidebarActive && !mobileMenu;

  useEffect(() => {
    const getTheme = localStorage.getItem("theme");
    setTheme(getTheme);
  }, [theme]);

  return (<>
    <section className={mobileMenu ? "overlay active" : desktopMenu ? "overlay success" : "overlay"}>
      {/* sidebar */}
      <aside
        className={
          sidebarActive
            ? "sidebar active"
            : mobileMenu
              ? "sidebar sidebar-open"
              : "sidebar"
        }
      >
        <div>
          <Link to="/llm-dashboard" className="sidebar-logo">
            <img
              // src="https://rank-tracker.techmagnate.com/logo_bg_1.svg"
              src="/assets/images/Techmagnate-logo.svg"
              alt="site logo"
              className="light-logo"
              width="200px"
            />
            <img
              // src="assets/images/logo-light.png"
              alt="site logo"
              className="dark-logo"
            />
            <img
              src="/assets/images/TM.png"
              // src="assets/images/logo-icon.png"
              alt="site logo"
              className="logo-icon"
            />
          </Link>
        </div>
        {/* …logo & close button… */}
        <div className="sidebar-menu-area">
          <ul className="sidebar-menu" id="sidebar-menu">
            {/* Dashboard */}
            {/* {(isAdmin || access.has("DASHBOARD")) && (
              <li className="dropdown">
                <Link to="#">
                  <Icon
                    icon="solar:home-smile-angle-outline"
                    className="menu-icon"
                  />
                  <span>Dashboard</span>
                </Link>
                <ul className="sidebar-submenu">
                  <li>
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                        isActive ? "active-page" : ""
                      }
                    >
                      <i className="ri-circle-fill circle-icon text-warning-600 w-auto" />
                      Ranking Dashboard
                    </NavLink>
                  </li>
                </ul>
              </li>
            )} */}

            {/* // Summary Dashboard */}
            <li>
              <ul className="sidebar-submenu">
                <li>
                  <NavLink
                    to="/summary-dashboard"
                    className={({ isActive }) =>
                      isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Summary Dashboard
                  </NavLink>
                </li>
              </ul>
            </li>

            <li>
              <ul className="sidebar-submenu">
                <li>
                  <NavLink
                    to="/keyword-overview"
                    className={({ isActive }) =>
                      isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Keyword Overview
                  </NavLink>
                </li>
              </ul>
            </li>

            <li>
              <ul className="sidebar-submenu">
                <li>
                  <NavLink
                    to="/serp-features-new"
                    className={({ isActive }) =>
                      isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    SERP Features
                  </NavLink>
                </li>
              </ul>
            </li>

            <li>
              <ul className="sidebar-submenu">
                <li>
                  <NavLink
                    to="/platform-rankings"
                    className={({ isActive }) =>
                      isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Platform Rankings
                  </NavLink>
                </li>
              </ul>
            </li>

            <li>
              <ul className="sidebar-submenu">
                <li>
                  <NavLink
                    to="/media-search"
                    className={({ isActive }) =>
                      isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Media Search
                  </NavLink>
                </li>
              </ul>
            </li>

            <li>
              <ul className="sidebar-submenu">
                <li>
                  <NavLink
                    to="/local-geo"
                    className={({ isActive }) =>
                      isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Local & Geo
                  </NavLink>
                </li>
              </ul>
            </li>

            <li>
              <ul className="sidebar-submenu">
                <li>
                  <NavLink
                    to="/community-results"
                    className={({ isActive }) =>
                      isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Community Results
                  </NavLink>
                </li>
              </ul>
            </li>

            <li>
              <ul className="sidebar-submenu">
                <li>
                  <NavLink
                    to="/serp-unified"
                    className={({ isActive }) =>
                      isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    SERP Unified
                  </NavLink>
                </li>
              </ul>
            </li>

            <li>
              <ul className="sidebar-submenu">
                <li>
                  <NavLink
                    to="/ai-insights"
                    className={({ isActive }) =>
                      isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    AI Insights
                  </NavLink>
                </li>
              </ul>
            </li>

            <li>
              <ul className="sidebar-submenu">
                <li>
                  <NavLink
                    to="/alerts"
                    className={({ isActive }) =>
                      isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Alerts
                  </NavLink>
                </li>
              </ul>
            </li>


            <li>
              <ul className="sidebar-submenu">
                <li>
                  <NavLink
                    to="/reports"
                    className={({ isActive }) =>
                      isActive ? "active-page" : ""
                    }
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                    Reports
                  </NavLink>
                </li>
              </ul>
            </li>

            {/* Access Manager */}
            {(isAdmin || access.has("ACCESS_MANAGER")) && (
              <li className="dropdown">
                <Link to="#">
                  <i className="fas fa-user-lock menu-icon" />
                  <span>Access Manager</span>
                </Link>
                <ul className="sidebar-submenu">
                  <li>
                    <NavLink
                      to="/access-manager"
                      className={({ isActive }) =>
                        isActive ? "active-page" : ""
                      }
                    >
                      <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                      Assign Roles
                    </NavLink>
                  </li>
                </ul>
              </li>
            )}

            {/* Local Project */}
            {(isAdmin || access.has("LOCAL_PROJECT_LIST")) && (
              <li className="dropdown">
                <Link to="#">
                  <i className="fas fa-map-marker menu-icon" />
                  <span>Local Rankings</span>
                </Link>
                <ul className="sidebar-submenu">
                  {(isAdmin || access.has("LOCAL_LIST")) && (
                    <li>
                      <NavLink
                        to="/local-projects"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                        Project List
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("LOCAL_ADD_CREATE")) && (
                    <li>
                      <NavLink
                        to="/create-local-project"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-warning-main w-auto" />
                        Create Project
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("LOCAL_UPLOAD")) && (
                    <li>
                      <NavLink
                        to="/upload-local-keywords"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-info-main w-auto" />
                        Upload Keywords
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("LOCAL_RANKINGS")) && (
                    <li>
                      <NavLink
                        to="/local-ranking"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                        Local Ranking
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            )}

            {/* Rankings */}
            {(isAdmin || access.has("RANKING_REPORT")) && (
              <li className="dropdown">
                <Link to="#">
                  <i className="fas fa-trophy menu-icon" />
                  <span>Rankings</span>
                </Link>
                <ul className="sidebar-submenu">
                  {(isAdmin || access.has("PROJECT_LIST")) && (
                    <li>
                      <NavLink
                        to="/projects"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                        Project List
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("PROJECT_CREATE")) && (
                    <li>
                      <NavLink
                        to="/create-project"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-warning-main w-auto" />
                        Create Project
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("PROJECT_UPLOAD")) && (
                    <li>
                      <NavLink
                        to="/upload-keywords"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-info-main w-auto" />
                        Upload Keywords
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("RANKING_REPORT")) && (
                    <li>
                      <NavLink
                        to="/ranking-report"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                        Ranking Report
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("RANK_GROUP")) && (
                    <li>
                      <NavLink
                        to="/rank-group"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-warning-main w-auto" />
                        Group Ranking
                      </NavLink>
                    </li>
                  )}

                  {/* {(isAdmin || access.has("CATEGORY_RANK_GROUP")) && (
                    <li>
                      <NavLink
                        to="/category-rank-group"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-info-main w-auto" />
                        Category Ranking
                      </NavLink>
                    </li>
                  )} */}

                  {(isAdmin || access.has("RANK_TRACKER")) && (
                    <li>
                      <NavLink
                        to="/rank-tracker"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-success-main w-auto" />
                        Keywords Movement
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("RANKING_MOVEMENT")) && (
                    <li>
                      <NavLink
                        to="/ranking-movement"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        Ranking Movement
                      </NavLink>
                    </li>
                  )}
                  {/* 
                  {(isAdmin || access.has("SERP_FEATURES")) && (
                    <li>
                      <NavLink
                        to="/serp-features"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        SERP Features
                      </NavLink>
                    </li>
                  )} */}


                </ul>
              </li>
            )}

            {/* Serp Features */}
            {(isAdmin || access.has("SERP_FEATURES")) && (
              <li className="dropdown">
                <Link to="#">
                  <i className="fas fa-user menu-icon" />
                  <span>SERP Features</span>
                </Link>
                <ul className="sidebar-submenu">
                  {/* {(isAdmin || access.has("SERP_FEATURES")) && (
                    <li>
                      <NavLink
                        to="/serp-features"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        Serp Features
                      </NavLink>
                    </li>
                  )} */}
                  {(isAdmin || access.has("FEATURED_SNIPPET")) && (
                    <li>
                      <NavLink
                        to="/featured-snippet"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-primary w-auto" />
                        Featured Snippet
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("APP_PACK")) && (
                    <li>
                      <NavLink
                        to="/app-pack"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        App Pack
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("PEOPLE_ALSO_ASK")) && (
                    <li>
                      <NavLink
                        to="/people-also-ask"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-success-main w-auto" />
                        People Also Ask
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("AI_OVERVIEW")) && (
                    <li>
                      <NavLink
                        to="/ai-overview"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-secondary w-auto" />
                        AI Overview
                      </NavLink>
                    </li>
                  )}

                  {(isAdmin || access.has("IMAGES")) && (
                    <li>
                      <NavLink
                        to="/images"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-warning w-auto" />
                        Images
                      </NavLink>
                    </li>
                  )}

                  {(isAdmin || access.has("LOCAL_PACK")) && (
                    <li>
                      <NavLink
                        to="/local-pack"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-success w-auto" />
                        Local Pack
                      </NavLink>
                    </li>
                  )}

                  {(isAdmin || access.has("TOP_STORIES")) && (
                    <li>
                      <NavLink
                        to="/top-stories"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-success w-auto" />
                        Top Stories
                      </NavLink>
                    </li>
                  )}

                  {(isAdmin || access.has("SHORT_VIDEOS")) && (
                    <li>
                      <NavLink
                        to="/short-videos"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-success w-auto" />
                        Short Videos
                      </NavLink>
                    </li>
                  )}

                  {(isAdmin || access.has("DISCUSSIONS_AND_FORUMS")) && (
                    <li>
                      <NavLink
                        to="/discussions-and-forums"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-success w-auto" />
                        Discussions and Forums
                      </NavLink>
                    </li>
                  )}

                  {(isAdmin || access.has("VIDEOS")) && (
                    <li>
                      <NavLink
                        to="/videos"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-success w-auto" />
                        Videos
                      </NavLink>
                    </li>
                  )}


                  {(isAdmin || access.has("SHOPPING")) && (
                    <li>
                      <NavLink
                        to="/shopping"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-success w-auto" />
                        Shopping
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            )}

            {/* Unified Dashboard */}
            {(isAdmin || access.has("UNIFIED_DASHBOARD")) && (
              <li className="dropdown">
                <Link to="#">
                  <i className="fas fa-user menu-icon" />
                  <span>Unified Dashboard</span>
                </Link>
                <ul className="sidebar-submenu">
                  {/* {(isAdmin || access.has("UNIFIED_DASHBOARD")) && (
                    <li>
                      <NavLink
                        to="/unified-dashboard"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        Unified Dashboard
                      </NavLink>
                    </li>
                  )}

                  {(isAdmin || access.has("UNIFIED_DASHBOARD")) && (
                    <li>
                      <NavLink
                        to="/serp-summary-dashboard"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        SERP Summary Dashboard
                      </NavLink>
                    </li>
                  )}

                  {(isAdmin || access.has("UNIFIED_DASHBOARD")) && (
                    <li>
                      <NavLink
                        to="/serp-category-summary-dashboard"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        SERP Category Summary Dashboard
                      </NavLink>
                    </li>
                  )}

                   {(isAdmin || access.has("UNIFIED_DASHBOARD")) && (
                    <li>
                      <NavLink
                        to="/serp-category-subcategory-summary-dashboard"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        SERP Sub Category Summary Dashboard
                      </NavLink>
                    </li>
                  )}

                  {(isAdmin || access.has("UNIFIED_DASHBOARD")) && (
                    <li>
                      <NavLink
                        to="/serp-category-only-summary-dashboard"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        SERP Category only Summary Dashboard
                      </NavLink>
                    </li>
                  )} */}

                  {(isAdmin || access.has("UNIFIED_DASHBOARD")) && (
                    <li>
                      <NavLink
                        to="/unified-dashboard"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        SERP Unified Dashboard
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            )}

            {/* Paid GP Tool */}
            {(isAdmin || access.has("ADD_GP_TOOL_PROJECT")) && (
              <li className="dropdown">
                <Link to="#">
                  <i className="fas fa-credit-card menu-icon" />
                  <span>Paid GP Tool</span>
                </Link>
                <ul className="sidebar-submenu">
                  <li>
                    <NavLink
                      to="/upload-target"
                      className={({ isActive }) =>
                        isActive ? "active-page" : ""
                      }
                    >
                      <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                      Add Project
                    </NavLink>
                  </li>
                  {(isAdmin || access.has("TRAFFIC_REPORT")) && (
                    <li>
                      <NavLink
                        to="/traffic-report"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-warning-main w-auto" />
                        Report
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            )}

            {/* All Rank */}
            {(isAdmin || access.has("ADD_All_RANK_PROJECT")) && (
              <li className="dropdown">
                <Link to="#">
                  <i className="fas fa-list menu-icon" />
                  <span>Rank Tracker</span>
                </Link>
                <ul className="sidebar-submenu">
                  <li>
                    <NavLink
                      to="/upload-allRank-keywords"
                      className={({ isActive }) =>
                        isActive ? "active-page" : ""
                      }
                    >
                      <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                      Add Project
                    </NavLink>
                  </li>
                  {(isAdmin || access.has("ALL_RANK")) && (
                    <li>
                      <NavLink
                        to="/all-rank-report"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-warning-main w-auto" />
                        Report
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            )}

            {/* AI Mode */}
            {(isAdmin || access.has("AI_MODE_RANKINGS")) && (
              <li className="dropdown">
                <Link to="/ai-mode">
                  <i className="fas fa-chart-line menu-icon" />
                  <span>AI Mode</span>
                </Link>
                <ul className="sidebar-submenu">
                  {(isAdmin || access.has("ADD_AI_MODE_PROJECT")) && (
                    <li>
                      <NavLink
                        to="/upload-ai-mode"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                        Add Project
                      </NavLink>
                    </li>
                  )}

                  {(isAdmin || access.has("AI_MODE")) && (
                    <li>
                      <NavLink
                        to="/ai-mode-report"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-warning-main w-auto" />
                        Project List
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("AI_MODE_RANKINGS")) && (
                    <li>
                      <NavLink
                        to="/ai-rankings"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        Daily Rankings
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            )}

            {/* LLM Mode */}
            {(isAdmin || access.has("LLM_DASHBOARD")) && (
              <li className="dropdown">
                <Link to="/llm">
                  <i className="fas fa-robot menu-icon" />
                  <span>LLM</span>
                </Link>
                <ul className="sidebar-submenu">
                  {(isAdmin || access.has("ADD_LLM_PROJECT")) && (
                    <li>
                      <NavLink
                        to="/upload-llm"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                        Add Project
                      </NavLink>
                    </li>
                  )}

                  {(isAdmin || access.has("LLM_PROJECTS")) && (
                    <li>
                      <NavLink
                        to="/llm-projects"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-success-600 w-auto" />
                        Project List
                      </NavLink>
                    </li>
                  )}


                  {(isAdmin || access.has("LLM_DASHBOARD")) && (
                    <li>
                      <NavLink
                        to="/llm-dashboard"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        LLM Dashboard
                      </NavLink>
                    </li>
                  )}

                  {/* {(isAdmin || access.has("LLM_RANKINGS_CHATGPT")) && (
                    <li>
                      <NavLink
                        to="/llm-rankings"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        Chatgpt Rankings
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("LLM_RANKINGS_GEMINI")) && (
                    <li>
                      <NavLink
                        to="/llm-rankings-gemini"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-primary-main w-auto" />
                        Gemini Rankings
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("LLM_RANKINGS_PERPLEXITY")) && (
                    <li>
                      <NavLink
                        to="/llm-rankings-perplexity"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-warning-main w-auto" />
                        Perplexity Rankings
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("LLM_RANKINGS_CLAUDE")) && (
                    <li>
                      <NavLink
                        to="/llm-rankings-claude"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-info w-auto" />
                        Claude Rankings
                      </NavLink>
                    </li>
                  )} */}




                  {/* sentiment menus */}
                  {(isAdmin || access.has("ADD_LLM_PROJECT")) && (
                    <li>
                      <NavLink
                        to="/upload-llm"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        {/* <i className="ri-circle-fill circle-icon text-primary-600 w-auto" /> */}

                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-scale w-4 h-4 text-sc-sidebar-foreground shrink-0 opacity-100"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></svg>
                        <span>Sentiment</span>
                      </NavLink>
                    </li>
                  )}

                  {(isAdmin || access.has("ADD_LLM_PROJECT")) && (
                    <li>
                      <NavLink
                        to="/upload-llm"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-link w-4 h-4 text-sc-sidebar-foreground shrink-0 opacity-100"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        <span>
                          Citations
                        </span>
                      </NavLink>
                    </li>
                  )}

                  {(isAdmin || access.has("ADD_LLM_PROJECT")) && (
                    <li>
                      <NavLink
                        to="/upload-llm"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square w-4 h-4 text-sc-sidebar-foreground shrink-0 opacity-100"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>

                        <span>
                          Prompts
                        </span>
                      </NavLink>
                    </li>
                  )}

                  {(isAdmin || access.has("ADD_LLM_PROJECT")) && (
                    <li>
                      <NavLink
                        to="/upload-llm"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe w-4 h-4 text-sc-sidebar-foreground shrink-0 opacity-100"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>                        <span>
                          AI Bot Analytics
                        </span>
                      </NavLink>
                    </li>
                  )}

                  {(isAdmin || access.has("ADD_LLM_PROJECT")) && (
                    <>
                      <p style={{
                        marginTop: "12px",
                        marginBottom: "10px",
                        marginLeft: "9px",
                        color: "#000000",
                        fontSize: "12px"
                      }}>Improve AI Visibility</p>
                      <li>
                        <NavLink
                          to="/upload-llm"
                          className={({ isActive }) =>
                            isActive ? "active-page" : ""
                          }
                        >
                          {/* <i className="ri-circle-fill circle-icon text-primary-600 w-auto" /> */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none">
                            <mask id="emoji_objects_static_svg__a" width="18" height="18" x="0" y="0" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }}>
                              <path fill="#d9d9d9" d="M0 0h18v18H0z"></path>
                            </mask>
                            <g mask="url(#emoji_objects_static_svg__a)">
                              <path
                                fill="url(#emoji_objects_static_svg__b)"
                                d="M9 16.5a1.7 1.7 0 0 1-1.5-.863q-.619 0-1.06-.44a1.45 1.45 0 0 1-.44-1.06v-2.662a5.4 5.4 0 0 1-1.772-1.931 5.3 5.3 0 0 1-.665-2.607q0-2.268 1.584-3.853Q6.73 1.5 9 1.5t3.853 1.584q1.585 1.585 1.585 3.854 0 1.443-.666 2.625A5.5 5.5 0 0 1 12 11.474v2.662q0 .62-.44 1.06-.442.44-1.06.44A1.7 1.7 0 0 1 9 16.5m-1.5-2.363h3v-.675h-3zm0-1.424h3V12h-3zM9.563 10.5V8.475l1.65-1.65-.788-.788L9 7.464 7.575 6.037l-.788.788 1.65 1.65V10.5z"
                              ></path>
                            </g>
                            <defs>
                              <linearGradient id="emoji_objects_static_svg__b" x1="3.552" x2="13.018" y1="9" y2="14.971" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#0090f7" />
                                <stop offset="0.25" stopColor="#ae65fb" />
                                <stop offset="0.5" stopColor="#e14fcf" />
                                <stop offset="0.75" stopColor="#ef4283" />
                                <stop offset="1" stopColor="#f4520b" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <span
                            style={{
                              background:
                                "linear-gradient(131deg,#0090F7 23.21%,#AE65FB 39.48%,#E14FCF 55.74%,#EF4283 72.01%,#F4520B 88.28%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              fontWeight: 600,
                            }}
                          >
                            Action Center
                          </span>
                        </NavLink>
                      </li>
                    </>
                  )}

                  {(isAdmin || access.has("ADD_LLM_PROJECT")) && (
                    <>
                      <p style={{
                        marginTop: "12px",
                        marginBottom: "10px",
                        marginLeft: "9px",
                        color: "#000000",
                        fontSize: "12px"
                      }}>Configure</p>
                      <li>
                        <NavLink
                          to="/upload-llm"
                          className={({ isActive }) =>
                            isActive ? "active-page" : ""
                          }
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle w-4 h-4 text-sc-sidebar-foreground shrink-0 opacity-100"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
                          <span
                          >
                            Topics and Prompts
                          </span>
                        </NavLink>
                      </li>

                      <li>
                        <NavLink
                          to="/upload-llm"
                          className={({ isActive }) =>
                            isActive ? "active-page" : ""
                          }
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy w-4 h-4 text-sc-sidebar-foreground shrink-0 opacity-100"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>  <span

                          >
                            Competitors
                          </span>
                        </NavLink>
                      </li>
                    </>
                  )}

                  {/* {(isAdmin || access.has("LLM_DASHBOARD")) && (
                    <li>
                      <NavLink
                        to="/llm-dashboard"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        ranks
                      </NavLink>
                    </li>
                  )} */}
                </ul>
              </li>


            )}

            {/* APP Rank  */}
            {(isAdmin || access.has("ADD_APP_RANK_PROJECT")) && (
              <li className="dropdown">
                <Link to="/app-rank">
                  <i className="fas fa-mobile-alt menu-icon" />
                  <span>App Ranking</span>
                </Link>
                <ul className="sidebar-submenu">
                  <li>
                    <NavLink
                      to="/upload-app-rank"
                      className={({ isActive }) =>
                        isActive ? "active-page" : ""
                      }
                    >
                      <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                      Add Project
                    </NavLink>
                  </li>

                  <li>
                    <NavLink
                      to="/app-projects"
                      className={({ isActive }) =>
                        isActive ? "active-page" : ""
                      }
                    >
                      <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                      Project List
                    </NavLink>
                  </li>

                  {(isAdmin || access.has("APP_RANK")) && (
                    <li>
                      <NavLink
                        to="/app-rankings"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        App Rankings
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("APPLE_RANK")) && (
                    <li>
                      <NavLink
                        to="/app-rankings-apple"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-success-main w-auto" />
                        Apple Rankings
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            )}

            {/* Bing Rank  */}
            {(isAdmin || access.has("ADD_BING_RANK_PROJECT")) && (
              <li className="dropdown">
                <Link to="/bing-rank">
                  <i className="fas fa-search menu-icon" />
                  <span>Bing Ranking</span>
                </Link>
                <ul className="sidebar-submenu">
                  <li>
                    <NavLink
                      to="/upload-bing-rank"
                      className={({ isActive }) =>
                        isActive ? "active-page" : ""
                      }
                    >
                      <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                      Add Project
                    </NavLink>
                  </li>
                  {(isAdmin || access.has("BING_PROJECTS")) && (
                    <li>
                      <NavLink
                        to="/bing-projects"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-warning-main w-auto" />
                        Project List
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("BING_RANKINGS")) && (
                    <li>
                      <NavLink
                        to="/bing-rankings"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        Bing Rankings
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            )}

            {/* Youtube Rank  */}
            {(isAdmin || access.has("ADD_YOUTUBE_RANK_PROJECT")) && (
              <li className="dropdown">
                <Link to="/youtube-rank">
                  <i className="fas fa-play menu-icon text-red-600" />
                  <span>Youtube Ranking</span>
                </Link>
                <ul className="sidebar-submenu">
                  <li>
                    <NavLink
                      to="/upload-youtube-rank"
                      className={({ isActive }) =>
                        isActive ? "active-page" : ""
                      }
                    >
                      <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                      Add Project
                    </NavLink>
                  </li>
                  {(isAdmin || access.has("YOUTUBE_PROJECTS")) && (
                    <li>
                      <NavLink
                        to="/youtube-projects"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                        Project List
                      </NavLink>
                    </li>
                  )}
                  {(isAdmin || access.has("YOUTUBE_RANKINGS")) && (
                    <li>
                      <NavLink
                        to="/youtube-rankings"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-danger-main w-auto" />
                        Youtube Rankings
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            )}

            {/* Users */}
            {(isAdmin || access.has("USER_VIEW")) && (
              <li className="dropdown">
                <Link to="#">
                  <i className="fas fa-user menu-icon" />
                  <span>Users</span>
                </Link>
                <ul className="sidebar-submenu">
                  <li>
                    <NavLink
                      to="/users"
                      className={({ isActive }) =>
                        isActive ? "active-page" : ""
                      }
                    >
                      <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
                      User List
                    </NavLink>
                  </li>
                  {(isAdmin || access.has("USER_ADD")) && (
                    <li>
                      <NavLink
                        to="/add-user"
                        className={({ isActive }) =>
                          isActive ? "active-page" : ""
                        }
                      >
                        <i className="ri-circle-fill circle-icon text-warning-main w-auto" />
                        Add User
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            )}
          </ul>
        </div>
      </aside>

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className="navbar-header">
          <div className={`row align-items-center ${location.pathname === "/llm-dashboard" ? "" : "justify-content-between"}`}>
            <div className="col-auto me-auto">
              <div className="d-flex flex-wrap align-items-center gap-4">
                <button
                  type="button"
                  className="sidebar-toggle"
                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                    <Icon
                      icon="iconoir:arrow-right"
                      className="icon text-2xl non-active"
                    />
                  ) : (
                    <Icon
                      icon="heroicons:bars-3-solid"
                      className="icon text-2xl non-active "
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type="button"
                  className="sidebar-mobile-toggle"
                >
                  <Icon icon="heroicons:bars-3-solid" className="icon" />
                </button>
                {/* <form className="navbar-search">
                  <input type="text" name="search" placeholder="Search" />
                  <Icon icon="ion:search-outline" className="icon" />
                </form> */}
              </div>
            </div>
            {/* Writesonic Dashboard */}
            {location.pathname === "/llm-dashboard" && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "auto",
                    border: "1px solid grey",
                    borderRadius: "5px",
                    padding: "4px 10px",
                  }}
                >
                  {/* Battery icon */}
                  <div
                    style={{
                      position: "relative",
                      width: "22px",
                      height: "10px",
                      border: "1.8px solid #555",
                      borderRadius: "2px",
                      padding: "1px",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        width: `${({ totalAnswers } / { totalAnswers }) * 100}%`,
                        height: "100%",
                        backgroundColor:
                          ({ totalAnswers } / { totalAnswers }) * 100 > 80
                            ? "#e74c3c" // red
                            : ({ totalAnswers } / { totalAnswers }) * 100 > 60
                              ? "#f39c12" // orange
                              : "#2ecc71", // green
                        borderRadius: "1px",
                        transition: "width 0.3s ease",
                      }}
                    ></div>
                    {/* Battery tip */}
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        right: "-3.5px",
                        width: "2.5px",
                        height: "5px",
                        backgroundColor: "#555",
                        borderRadius: "1px",
                      }}
                    ></div>
                  </div>

                  <div style={{ fontSize: "13px", cursor: "pointer" }}
                    onClick={() => navigate(`${llmProjectId}/prompts?date=${promptsSelectedDate}`)}
                  >
                    <span style={{ color: "#000000", fontWeight: "600" }}>{totalAnswers}</span>{" "}
                    <span style={{ color: "#a7a7a7" }}>/ {totalAnswers} {"prompts"}</span>
                  </div>
                </div>
              </>
            )}

            {(
              location.pathname === "/summary-dashboard" ||
              location.pathname === "/keyword-overview") && (
                <SerpFilterComponent
                  user={user}
                  filter={filter}
                  setFilter={setFilter}
                  projectData={selectedProjectData}
                  showStats={false}
                />
              )}


            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-3">
                {/* ThemeToggleButton */}
                {/* <ThemeToggleButton /> */}
                {/* <div className="dropdown d-none d-sm-inline-block">
                    <button
                      className="has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      <img
                        src="assets/images/lang-flag.png"
                        alt="Wowdash"
                        className="w-24 h-24 object-fit-cover rounded-circle"
                      />
                    </button>
                    <div className="dropdown-menu to-top dropdown-menu-sm">
                      <div className="py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                        <div>
                          <h6 className="text-lg text-primary-light fw-semibold mb-0">
                            Choose Your Language
                          </h6>
                        </div>
                      </div>
                      <div className="max-h-400-px overflow-y-auto scroll-sm pe-8">
                        <div className="form-check style-check d-flex align-items-center justify-content-between mb-16">
                          <label
                            className="form-check-label line-height-1 fw-medium text-secondary-light"
                            htmlFor="english"
                          >
                            <span className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                              <img
                                src="assets/images/flags/flag1.png"
                                alt=""
                                className="w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0"
                              />
                              <span className="text-md fw-semibold mb-0">
                                English
                              </span>
                            </span>
                          </label>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="crypto"
                            id="english"
                          />
                        </div>
                        <div className="form-check style-check d-flex align-items-center justify-content-between mb-16">
                          <label
                            className="form-check-label line-height-1 fw-medium text-secondary-light"
                            htmlFor="japan"
                          >
                            <span className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                              <img
                                src="assets/images/flags/flag2.png"
                                alt=""
                                className="w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0"
                              />
                              <span className="text-md fw-semibold mb-0">
                                Japan
                              </span>
                            </span>
                          </label>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="crypto"
                            id="japan"
                          />
                        </div>
                        <div className="form-check style-check d-flex align-items-center justify-content-between mb-16">
                          <label
                            className="form-check-label line-height-1 fw-medium text-secondary-light"
                            htmlFor="france"
                          >
                            <span className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                              <img
                                src="assets/images/flags/flag3.png"
                                alt=""
                                className="w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0"
                              />
                              <span className="text-md fw-semibold mb-0">
                                France
                              </span>
                            </span>
                          </label>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="crypto"
                            id="france"
                          />
                        </div>
                        <div className="form-check style-check d-flex align-items-center justify-content-between mb-16">
                          <label
                            className="form-check-label line-height-1 fw-medium text-secondary-light"
                            htmlFor="germany"
                          >
                            <span className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                              <img
                                src="assets/images/flags/flag4.png"
                                alt=""
                                className="w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0"
                              />
                              <span className="text-md fw-semibold mb-0">
                                Germany
                              </span>
                            </span>
                          </label>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="crypto"
                            id="germany"
                          />
                        </div>
                        <div className="form-check style-check d-flex align-items-center justify-content-between mb-16">
                          <label
                            className="form-check-label line-height-1 fw-medium text-secondary-light"
                            htmlFor="korea"
                          >
                            <span className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                              <img
                                src="assets/images/flags/flag5.png"
                                alt=""
                                className="w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0"
                              />
                              <span className="text-md fw-semibold mb-0">
                                South Korea
                              </span>
                            </span>
                          </label>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="crypto"
                            id="korea"
                          />
                        </div>
                        <div className="form-check style-check d-flex align-items-center justify-content-between mb-16">
                          <label
                            className="form-check-label line-height-1 fw-medium text-secondary-light"
                            htmlFor="bangladesh"
                          >
                            <span className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                              <img
                                src="assets/images/flags/flag6.png"
                                alt=""
                                className="w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0"
                              />
                              <span className="text-md fw-semibold mb-0">
                                Bangladesh
                              </span>
                            </span>
                          </label>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="crypto"
                            id="bangladesh"
                          />
                        </div>
                        <div className="form-check style-check d-flex align-items-center justify-content-between mb-16">
                          <label
                            className="form-check-label line-height-1 fw-medium text-secondary-light"
                            htmlFor="india"
                          >
                            <span className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                              <img
                                src="assets/images/flags/flag7.png"
                                alt=""
                                className="w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0"
                              />
                              <span className="text-md fw-semibold mb-0">
                                India
                              </span>
                            </span>
                          </label>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="crypto"
                            id="india"
                          />
                        </div>
                        <div className="form-check style-check d-flex align-items-center justify-content-between">
                          <label
                            className="form-check-label line-height-1 fw-medium text-secondary-light"
                            htmlFor="canada"
                          >
                            <span className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                              <img
                                src="assets/images/flags/flag8.png"
                                alt=""
                                className="w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0"
                              />
                              <span className="text-md fw-semibold mb-0">
                                Canada
                              </span>
                            </span>
                          </label>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="crypto"
                            id="canada"
                          />
                        </div>
                      </div>
                    </div>
                  </div> */}
                {/* Language dropdown end */}
                {/* <div className="dropdown">
                  <button
                    className="has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <Icon
                      icon="mage:email"
                      className="text-primary-light text-xl"
                    />
                  </button>
                  <div className="dropdown-menu to-top dropdown-menu-lg p-0">
                    <div className="m-16 py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                      <div>
                        <h6 className="text-lg text-primary-light fw-semibold mb-0">
                          Message
                        </h6>
                      </div>
                      <span className="text-primary-600 fw-semibold text-lg w-40-px h-40-px rounded-circle bg-base d-flex justify-content-center align-items-center">
                        05
                      </span>
                    </div>
                    <div className="max-h-400-px overflow-y-auto scroll-sm pe-4">
                      <Link
                        to="#"
                        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between"
                      >
                        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                          <span className="w-40-px h-40-px rounded-circle flex-shrink-0 position-relative">
                            <img
                              src="assets/images/notification/profile-3.png"
                              alt=""
                            />
                            <span className="w-8-px h-8-px bg-success-main rounded-circle position-absolute end-0 bottom-0" />
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-4">
                              Kathryn Murphy
                            </h6>
                            <p className="mb-0 text-sm text-secondary-light text-w-100-px">
                              hey! there i’m...
                            </p>
                          </div>
                        </div>
                        <div className="d-flex flex-column align-items-end">
                          <span className="text-sm text-secondary-light flex-shrink-0">
                            12:30 PM
                          </span>
                          <span className="mt-4 text-xs text-base w-16-px h-16-px d-flex justify-content-center align-items-center bg-warning-main rounded-circle">
                            8
                          </span>
                        </div>
                      </Link>
                      <Link
                        to="#"
                        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between"
                      >
                        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                          <span className="w-40-px h-40-px rounded-circle flex-shrink-0 position-relative">
                            <img
                              src="assets/images/notification/profile-4.png"
                              alt=""
                            />
                            <span className="w-8-px h-8-px  bg-neutral-300 rounded-circle position-absolute end-0 bottom-0" />
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-4">
                              Kathryn Murphy
                            </h6>
                            <p className="mb-0 text-sm text-secondary-light text-w-100-px">
                              hey! there i’m...
                            </p>
                          </div>
                        </div>
                        <div className="d-flex flex-column align-items-end">
                          <span className="text-sm text-secondary-light flex-shrink-0">
                            12:30 PM
                          </span>
                          <span className="mt-4 text-xs text-base w-16-px h-16-px d-flex justify-content-center align-items-center bg-warning-main rounded-circle">
                            2
                          </span>
                        </div>
                      </Link>
                      <Link
                        to="#"
                        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between bg-neutral-50"
                      >
                        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                          <span className="w-40-px h-40-px rounded-circle flex-shrink-0 position-relative">
                            <img
                              src="assets/images/notification/profile-5.png"
                              alt=""
                            />
                            <span className="w-8-px h-8-px bg-success-main rounded-circle position-absolute end-0 bottom-0" />
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-4">
                              Kathryn Murphy
                            </h6>
                            <p className="mb-0 text-sm text-secondary-light text-w-100-px">
                              hey! there i’m...
                            </p>
                          </div>
                        </div>
                        <div className="d-flex flex-column align-items-end">
                          <span className="text-sm text-secondary-light flex-shrink-0">
                            12:30 PM
                          </span>
                          <span className="mt-4 text-xs text-base w-16-px h-16-px d-flex justify-content-center align-items-center bg-neutral-400 rounded-circle">
                            0
                          </span>
                        </div>
                      </Link>
                      <Link
                        to="#"
                        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between bg-neutral-50"
                      >
                        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                          <span className="w-40-px h-40-px rounded-circle flex-shrink-0 position-relative">
                            <img
                              src="assets/images/notification/profile-6.png"
                              alt=""
                            />
                            <span className="w-8-px h-8-px bg-neutral-300 rounded-circle position-absolute end-0 bottom-0" />
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-4">
                              Kathryn Murphy
                            </h6>
                            <p className="mb-0 text-sm text-secondary-light text-w-100-px">
                              hey! there i’m...
                            </p>
                          </div>
                        </div>
                        <div className="d-flex flex-column align-items-end">
                          <span className="text-sm text-secondary-light flex-shrink-0">
                            12:30 PM
                          </span>
                          <span className="mt-4 text-xs text-base w-16-px h-16-px d-flex justify-content-center align-items-center bg-neutral-400 rounded-circle">
                            0
                          </span>
                        </div>
                      </Link>
                      <Link
                        to="#"
                        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between"
                      >
                        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                          <span className="w-40-px h-40-px rounded-circle flex-shrink-0 position-relative">
                            <img
                              src="assets/images/notification/profile-7.png"
                              alt=""
                            />
                            <span className="w-8-px h-8-px bg-success-main rounded-circle position-absolute end-0 bottom-0" />
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-4">
                              Kathryn Murphy
                            </h6>
                            <p className="mb-0 text-sm text-secondary-light text-w-100-px">
                              hey! there i’m...
                            </p>
                          </div>
                        </div>
                        <div className="d-flex flex-column align-items-end">
                          <span className="text-sm text-secondary-light flex-shrink-0">
                            12:30 PM
                          </span>
                          <span className="mt-4 text-xs text-base w-16-px h-16-px d-flex justify-content-center align-items-center bg-warning-main rounded-circle">
                            8
                          </span>
                        </div>
                      </Link>
                    </div>
                    <div className="text-center py-12 px-16">
                      <Link
                        to="#"
                        className="text-primary-600 fw-semibold text-md"
                      >
                        See All Message
                      </Link>
                    </div>
                  </div>
                </div> */}
                {/* Message dropdown end */}
                {/* <div className="dropdown">
                  <button
                    className="has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <Icon
                      icon="iconoir:bell"
                      className="text-primary-light text-xl"
                    />
                  </button>
                  <div className="dropdown-menu to-top dropdown-menu-lg p-0">
                    <div className="m-16 py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                      <div>
                        <h6 className="text-lg text-primary-light fw-semibold mb-0">
                          Notifications
                        </h6>
                      </div>
                      <span className="text-primary-600 fw-semibold text-lg w-40-px h-40-px rounded-circle bg-base d-flex justify-content-center align-items-center">
                        05
                      </span>
                    </div>
                    <div className="max-h-400-px overflow-y-auto scroll-sm pe-4">
                      <Link
                        to="#"
                        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between"
                      >
                        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                          <span className="w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
                            <Icon
                              icon="bitcoin-icons:verify-outline"
                              className="icon text-xxl"
                            />
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-4">
                              Congratulations
                            </h6>
                            <p className="mb-0 text-sm text-secondary-light text-w-200-px">
                              Your profile has been Verified. Your profile has
                              been Verified
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-secondary-light flex-shrink-0">
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        to="#"
                        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between bg-neutral-50"
                      >
                        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                          <span className="w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
                            <img
                              src="assets/images/notification/profile-1.png"
                              alt=""
                            />
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-4">
                              Ronald Richards
                            </h6>
                            <p className="mb-0 text-sm text-secondary-light text-w-200-px">
                              You can stitch between artboards
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-secondary-light flex-shrink-0">
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        to="#"
                        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between"
                      >
                        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                          <span className="w-44-px h-44-px bg-info-subtle text-info-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
                            AM
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-4">
                              Arlene McCoy
                            </h6>
                            <p className="mb-0 text-sm text-secondary-light text-w-200-px">
                              Invite you to prototyping
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-secondary-light flex-shrink-0">
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        to="#"
                        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between bg-neutral-50"
                      >
                        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                          <span className="w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
                            <img
                              src="assets/images/notification/profile-2.png"
                              alt=""
                            />
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-4">
                              Annette Black
                            </h6>
                            <p className="mb-0 text-sm text-secondary-light text-w-200-px">
                              Invite you to prototyping
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-secondary-light flex-shrink-0">
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        to="#"
                        className="px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between"
                      >
                        <div className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                          <span className="w-44-px h-44-px bg-info-subtle text-info-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
                            DR
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-4">
                              Darlene Robertson
                            </h6>
                            <p className="mb-0 text-sm text-secondary-light text-w-200-px">
                              Invite you to prototyping
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-secondary-light flex-shrink-0">
                          23 Mins ago
                        </span>
                      </Link>
                    </div>
                    <div className="text-center py-12 px-16">
                      <Link
                        to="#"
                        className="text-primary-600 fw-semibold text-md"
                      >
                        See All Notification
                      </Link>
                    </div>
                  </div>
                </div> */}
                {/* Notification dropdown end */}



                {/* <div>
                  <span style={{ color: "black" }}>
                    {user?.firstName} {user?.lastName}
                  </span>
                </div> */}

                <div className="dropdown">
                  <button
                    className="d-flex justify-content-center align-items-center rounded-circle"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <img
                      src="assets/images/admin-user.png"
                      alt="image_user"
                      className="w-40-px h-40-px object-fit-cover rounded-circle"
                    />
                  </button>
                  <div className="dropdown-menu to-top dropdown-menu-sm">
                    <div className="py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                      <div>
                        <h6 className="text-lg text-primary-light fw-semibold mb-2">
                          {user?.firstName + " " + user?.lastName ||
                            "Tushar Verma"}
                        </h6>
                        <span className="text-secondary-light fw-medium text-sm">
                          <span>Role: </span>{" "}
                          <span>
                            <b>{user?.role?.toUpperCase() || ""}</b>
                          </span>
                        </span>
                      </div>
                      <button type="button" className="hover-text-danger">
                        <Icon
                          icon="radix-icons:cross-1"
                          className="icon text-xl"
                        />
                      </button>
                    </div>
                    <ul className="to-top-list">
                      {/* <li>
                        <Link
                          className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3"
                          to="/view-profile"
                        >
                          <Icon
                            icon="solar:user-linear"
                            className="icon text-xl"
                          />{" "}
                          My Profile
                        </Link>
                      </li> */}
                      {/* <li>
                        <Link
                          className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3"
                          to="/email"
                        >
                          <Icon
                            icon="tabler:message-check"
                            className="icon text-xl"
                          />{" "}
                          Inbox
                        </Link>
                      </li> */}
                      <li>
                        <Link
                          className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3"
                          to="/setting"
                        >
                          <Icon
                            icon="icon-park-outline:setting-two"
                            className="icon text-xl"
                          />
                          Change Password
                        </Link>
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3"
                          onClick={logout}
                        >
                          <Icon icon="lucide:power" className="icon text-xl" />{" "}
                          Log out
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Profile dropdown end */}
              </div>
            </div>

          </div>
        </div>

        {/* dashboard-main-body */}
        {/* <div className="dashboard-main-body">{children}</div> */}
        <div className={`${writesonicStyle}`}>{children}</div>

        {/* Footer section */}
        <div className=" mt-12">
          {/* <footer className="d-footer">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto">
                <p className="mb-0">
                  Copyright © 2025 Techmagnate®. All rights reserved. (Beta Version)
                </p>
              </div>
            </div>
          </footer> */}
        </div>

      </main>
      <footer className="d-footer">
        <div className="row align-items-center justify-content-between">
          <div className="col-auto">
            <p className="mb-0">
              Copyright © 2026 Techmagnate®. All rights reserved. (Beta Version)
            </p>
          </div>
        </div>
      </footer>
    </section>

  </>
  );
};

export default MasterLayout;
