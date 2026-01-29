import React, { useContext, useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import ThemeToggleButton from "../../helper/ThemeToggleButton";
import AuthContext from "../../context/AuthContext";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import WriteSonicDashboard from "../../pages/LLM/WriteSonicDashboard";
import InternalAuthContext from "../context/InternalAuthContext";

const InternalMasterLayout = ({ children }) => {
  let [sidebarActive, setSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const { logout, user } = useContext(InternalAuthContext);
  const [theme, setTheme] = useState("light");
  const access = new Set(user?.access || []);
  const isAdmin = user?.role === "admin";

  const location = useLocation();

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
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  const isCollapsed = !sidebarActive && !mobileMenu;

  useEffect(() => {
    const getTheme = localStorage.getItem("theme");
    setTheme(getTheme);
  }, [theme]);



  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
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
          <Link to="/" className="sidebar-logo">
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

            {/* Internal Project */}
            <li className="dropdown">
              <Link to="#">
                <i className="fas fa-map-marker menu-icon" />
                <span>Dashboard</span>
              </Link>
              <ul className="sidebar-submenu">
                {/* <li>
                  <NavLink
                    to="/internal/table/1"
                    className={({ isActive }) => (isActive ? "active-page" : "")}
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600"></i>
                    Existing Page Optimization Manual Competitor
                  </NavLink>
                </li> */}
                {/* <li>
                  <NavLink
                    to="/internal/table/2"
                    className={({ isActive }) => (isActive ? "active-page" : "")}
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600"></i>
                    Existing Page Optimization 
                  </NavLink>
                </li> */}
                {/* <li>
                  <NavLink
                    to="/internal/table/3"
                    className={({ isActive }) => (isActive ? "active-page" : "")}
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600"></i>
                    New Table Optimization
                  </NavLink>
                </li> */}
                <li>
                  <NavLink
                    to="/internal/table/4"
                    className={({ isActive }) => (isActive ? "active-page" : "")}
                  >
                    <i className="ri-circle-fill circle-icon text-primary-600"></i>
                    Tata Capital
                  </NavLink>
                </li>
              </ul>
            </li>

          </ul>
        </div>
      </aside >

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className="navbar-header">
          <div className={`row align-items-center justify-content-between`}>
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
              </div>
            </div>


            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-3">
                <div>
                  <span style={{ color: "black" }}>
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>

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
                            <b>{user?.role?.split('_').join(' ').toUpperCase() || ""}</b>
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
        <div className="dashboard-main-body">
          <Outlet />

        </div>

      </main>
    </section >
  );
};

export default InternalMasterLayout;
