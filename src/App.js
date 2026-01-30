import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import CreateProject from "./pages/Project/CreateProject";
import UploadKeyword from "./pages/Project/UploadKeyword";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import RankTrackerIndex from "./pages/KeywordsMovement/Index";
import ProjectIndex from "./pages/Project/Index";
import AppLayout from "./components/Layout/AppLayout";
import { CustomToastContainer } from "./lib/CustomToast";
import UserIndex from "./pages/User/UserIndex";
import AddUser from "./pages/User/AddUser";
import Index from "./pages/KeywordRankings/KeywordRankingIndex";
import LocalRanking from "./pages/LocalRanking/Index";
import RankGroupIndex from "./pages/GroupRanking/Index";
import CategoryRankGroupIndex from "./pages/CategoryRanking/Index";
import RankingReportIndex from "./pages/RankingMovement/Index";
import AuthContext from "./context/AuthContext";
import { useContext, useEffect } from "react";
import ProtectedRoute from "./components/ProtectedRoutes";
import LocalProjectIndex from "./pages/LocalProject/Index";
import CreateLocalProject from "./pages/LocalProject/CreateLocalProject";
import UploadLocalKeyword from "./pages/LocalProject/UploadLocalKeyword";
import UploadTarget from "./pages/Traffic/UploadTarget";
import TrafficIndex from "./pages/Traffic/Index";
import TrafficReport from "./pages/Traffic/trafficReport";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import RankingDashboard from "./pages/Dashboard/RankingDashboard ";
import MasterLayout from "./masterLayout/MasterLayout";
import AllRank from "./pages/AllRankTracker/Index";
import AllRankReport from "./pages/AllRankTracker/AllRankReport";
import UploadAllRank from "./pages/AllRankTracker/UploadAllRank";
import AccessManager from "./pages/AccessManager/Index";
import Setting from "./pages/Setting";
import UploadAIKeywords from "./pages/AIMode/UploadAIKeywords";
import AIModeReport from "./pages/AIMode/AIModeReport";
import AIMode from "./pages/AIMode/ProjectList";
import DailyRankingDashboard from "./pages/AIMode/DailyRankingDashboard";
import Projects from "./pages/AppRanking/Projects";
import DailyAppRankingDashboard from "./pages/AppRanking/DailyAppRankingDashboard";
import DailyAppleRankingDashboard from "./pages/AppRanking/DailyAppleRankingDashboard";
import BingProjects from "./pages/BingRanking/AddProject";
import YoutubeProjects from "./pages/YoutubeRanking/Projects";
import UploadLLMKeywords from "./pages/LLM/UploadLLMKeywords";
import DailyLLMRankingDashboard from "./pages/LLM/DailyLLMRankingDashboard";
import GeminiRankings from "./pages/LLM/DailyGeminiRankingDashboard";
import PerplexityRankings from "./pages/LLM/DailyPerplexityRankingDashboard";
import ClaudeRankings from "./pages/LLM/DailyClaudeRankingDashboard";
import ProjectList from "./pages/LLM/ProjectList";
import DailyYoutubeRankingDashboard from "./pages/YoutubeRanking/DailyYoutubeRankingDashboard";
import CreateProjects from "./pages/YoutubeRanking/Projects";
import YoutubeProjectList from "./pages/YoutubeRanking/ProjectList";
import BingRankings from "./pages/BingRanking/DailyRankingReport";
import BingProjectList from "./pages/BingRanking/BingProjectList";
import AIProjectList from "./pages/AIMode/ProjectList";
import AppProjectList from "./pages/AppRanking/AppProjectList";
import LLMDashboard from "./pages/LLM/LLMDashboard";
import WriteSonicDashboard from "./pages/LLM/WriteSonicDashboard";
import WriteSonicAllCitations from "./pages/LLM/WriteSonicAllCitations";
import BrandCitations from "./pages/LLM/BrandCitations";
import MyPagesCited from "./pages/LLM/MyPagesCited";
import { LLMProvider, useLLM } from "./context/LLMContext";
import InternalLogin from "./Internal/InternalLogin";
import { InternalAuthProvider } from "./Internal/context/InternalAuthContext";
import PagesMentioningMe from "./pages/LLM/ThirdPartyPages";
import ThirdPartyPages from "./pages/LLM/ThirdPartyPages";
import UniquePrompts from "./pages/LLM/UniquePrompts";
import SerpFeatures from "./pages/SerpFeatures/Index";
import UnifiedDashboard from "./pages/UnifiedDashboard/Index";
import FeaturedSnippetPage from "./pages/SerpFeatures/FeaturedSnippetPage";
import AppPackPage from "./pages/SerpFeatures/AppPackPage";
import PAAPage from "./pages/SerpFeatures/PAAPage";
import AIOverviewPage from "./pages/SerpFeatures/AIOverviewPage";
import ImagesPages from "./pages/SerpFeatures/ImagesPages";
import LocalPackPages from "./pages/SerpFeatures/LocalPackPages";
import TopStoriesPage from "./pages/SerpFeatures/TopStoriesPage";
import ShortVideosPage from "./pages/SerpFeatures/ShortVideosPage";
import DiscussionsAndForumsPage from "./pages/SerpFeatures/DiscussionsAndForumsPage";
import VideoPage from "./pages/SerpFeatures/VideoPage";
import ShoppingPage from "./pages/SerpFeatures/ShoppingPage";
import UnifiedTesting from "./pages/UnifiedDashboard/UnifiedTesting";
import { SummaryDashboard } from "./components/view/SummaryDashboard";
import { KeywordOverview } from "./components/view/KeywordOverview";
import { SERPFeatureAnalysis } from "./components/view/SERPFeatureAnalysis";
import { PlatformRankings } from "./components/view/PlatformRankings";
import { MediaSearchAnalysis } from "./components/view/MediaSearchAnalysis";
import { LocalGeoAnalysis } from "./components/view/LocalGeoAnalysis";
import { CommunityResults } from "./components/view/CommunityResults";
import { SERPUnifiedDashboard } from "./components/view/SERPUnifiedDashboard";
import { AIInsights } from "./components/view/AIInsights";
import { AlertsView } from "./components/view/AlertsView";
import { ReportsView } from "./components/view/ReportsView";

export const RoleBasedRoute = ({ roles, children }) => {
  const { user } = useContext(AuthContext);
  const userRole = user?.role || "";

  if (!roles.includes(userRole)) {
    return null;
  }

  return children;
};

function App() {
  const { user } = useContext(AuthContext);
  const userEmail = user?.email || "";

  const isSpecial = userEmail === "saud.khan@techmagnate.com";

  return (
    <>
      <CustomToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
      />
      {/* <TestStyle/> */}
      <RouteScrollToTop />

      <LLMProvider>
        <Routes>
          {/* <Route
            path="/internal-login"
            element={
              <InternalAuthProvider>
                <InternalLogin />
              </InternalAuthProvider>
            }
          />           */}
          {/* Public Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/setting"
            element={
              <MasterLayout>
                <Setting />
              </MasterLayout>
            }
          />

          {/* Protected Routes */}

          {/* Dashboard Routes */}

          <Route
            path="/"
            element={
              <ProtectedRoute moduleKey="DASHBOARD">
                <RankingDashboard />
              </ProtectedRoute>
            }
          />
          {/* Access Manager */}
          <Route
            path="/access-manager"
            element={
              <ProtectedRoute moduleKey="ACCESS_MANAGER">
                <MasterLayout>
                  <AccessManager />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* Project Routes */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute moduleKey="PROJECT_LIST">
                <MasterLayout>
                  <ProjectIndex />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-project"
            element={
              <ProtectedRoute moduleKey="PROJECT_CREATE">
                <MasterLayout>
                  <CreateProject />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-keywords"
            element={
              <ProtectedRoute moduleKey="PROJECT_UPLOAD">
                <MasterLayout>
                  <UploadKeyword />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* Local Rankings */}
          <Route
            path="/local-projects"
            element={
              <ProtectedRoute moduleKey="LOCAL_PROJECTS_LIST">
                <MasterLayout>
                  <LocalProjectIndex />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-local-project"
            element={
              <ProtectedRoute moduleKey="LOCAL_ADD_PROJECT">
                <MasterLayout>
                  <CreateLocalProject />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-local-keywords"
            element={
              <ProtectedRoute moduleKey="LOCAL_UPLOAD">
                <MasterLayout>
                  <UploadLocalKeyword />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/local-ranking"
            element={
              <ProtectedRoute moduleKey="LOCAL_RANKINGS">
                <MasterLayout>
                  <LocalRanking />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* Ranking Tool Routes */}
          <Route
            path="/ranking-report"
            element={
              <ProtectedRoute moduleKey="RANKING_REPORT">
                <MasterLayout>
                  <Index />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ranking-movement"
            element={
              <ProtectedRoute moduleKey="RANKING_MOVEMENT">
                <MasterLayout>
                  <RankingReportIndex />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rank-group"
            element={
              <ProtectedRoute moduleKey="RANK_GROUP">
                <MasterLayout>
                  <RankGroupIndex />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/category-rank-group"
            element={
              <ProtectedRoute moduleKey="CATEGORY_RANK_GROUP">
                <MasterLayout>
                  <CategoryRankGroupIndex />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rank-tracker"
            element={
              <ProtectedRoute moduleKey="RANK_TRACKER">
                <MasterLayout>
                  <RankTrackerIndex />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* Serp Features */}
          <Route
            path="/serp-features"
            element={
              <ProtectedRoute moduleKey="SERP_FEATURES">
                <MasterLayout>
                  <SerpFeatures />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/featured-snippet"
            element={
              <ProtectedRoute moduleKey="FEATURED_SNIPPET">
                <MasterLayout>
                  <FeaturedSnippetPage />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/app-pack"
            element={
              <ProtectedRoute moduleKey="APP_PACK">
                <MasterLayout>
                  <AppPackPage />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/people-also-ask"
            element={
              <ProtectedRoute moduleKey="PEOPLE_ALSO_ASK">
                <MasterLayout>
                  <PAAPage />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-overview"
            element={
              <ProtectedRoute moduleKey="AI_OVERVIEW">
                <MasterLayout>
                  <AIOverviewPage />
                </MasterLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/images"
            element={
              <ProtectedRoute moduleKey="IMAGES">
                <MasterLayout>
                  <ImagesPages />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/local-pack"
            element={
              <ProtectedRoute moduleKey="LOCAL_PACK">
                <MasterLayout>
                  <LocalPackPages />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/top-stories"
            element={
              <ProtectedRoute moduleKey="TOP_STORIES">
                <MasterLayout>
                  <TopStoriesPage />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/short-videos"
            element={
              <ProtectedRoute moduleKey="TOP_STORIES">
                <MasterLayout>
                  <ShortVideosPage />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/discussions-and-forums"
            element={
              <ProtectedRoute moduleKey="DISCUSSIONS_AND_FORUMS">
                <MasterLayout>
                  <DiscussionsAndForumsPage />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/videos"
            element={
              <ProtectedRoute moduleKey="VIDEOS">
                <MasterLayout>
                  <VideoPage />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/shopping"
            element={
              <ProtectedRoute moduleKey="SHOPPING">
                <MasterLayout>
                  <ShoppingPage />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/unified-dashboard"
            element={
              <ProtectedRoute moduleKey="UNIFIED_DASHBOARD">
                <MasterLayout>
                  <UnifiedDashboard />
                </MasterLayout>
              </ProtectedRoute>
            }
          /> */}

          {/* <Route
            path="/serp-summary-dashboard"
            element={
              <ProtectedRoute moduleKey="UNIFIED_DASHBOARD">
                <MasterLayout>
                  <SerpSummaryDashboard />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/serp-category-summary-dashboard"
            element={
              <ProtectedRoute moduleKey="UNIFIED_DASHBOARD">
                <MasterLayout>
                  <SerpCategorySummaryDashboard />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/serp-category-subcategory-summary-dashboard"
            element={
              <ProtectedRoute moduleKey="UNIFIED_DASHBOARD">
                <MasterLayout>
                  <SerpCategorySubcategorySummaryDashboard />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/serp-category-only-summary-dashboard"
            element={
              <ProtectedRoute moduleKey="UNIFIED_DASHBOARD">
                <MasterLayout>
                  <SerpCategoryOnlySummaryDashboard />
                </MasterLayout>
              </ProtectedRoute>
            }
          /> */}

          <Route
            path="/unified-dashboard"
            element={
              <ProtectedRoute moduleKey="UNIFIED_DASHBOARD">
                <MasterLayout>
                  <UnifiedTesting />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload-target"
            element={
              <ProtectedRoute moduleKey="ADD_GP_TOOL_PROJECT">
                <MasterLayout>
                  <UploadTarget />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/traffic-report"
            element={
              <ProtectedRoute moduleKey="TRAFFIC_REPORT">
                <MasterLayout>
                  <TrafficIndex />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/traffic-report/:id"
            element={
              <ProtectedRoute moduleKey="TRAFFIC_REPORT">
                <MasterLayout>
                  <TrafficReport />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* user routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute moduleKey="USER_VIEW">
                <MasterLayout>
                  <UserIndex />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-user"
            element={
              <ProtectedRoute moduleKey="USER_ADD">
                <MasterLayout>
                  <AddUser />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* All rank */}
          <Route
            path="/upload-allRank-keywords"
            element={
              <ProtectedRoute moduleKey="ADD_All_RANK_PROJECT">
                <MasterLayout>
                  <UploadAllRank />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/all-rank-report"
            element={
              <ProtectedRoute moduleKey="ALL_RANK">
                <MasterLayout>
                  <AllRank />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/all-rank-report/:id"
            element={
              <ProtectedRoute moduleKey="ALL_RANK">
                <MasterLayout>
                  <AllRankReport />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* AI Mode */}
          <Route
            path="/upload-ai-mode"
            element={
              <ProtectedRoute moduleKey="ADD_AI_MODE_PROJECT">
                <MasterLayout>
                  <UploadAIKeywords />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-mode-report"
            element={
              <ProtectedRoute moduleKey="AI_MODE">
                <MasterLayout>
                  <AIProjectList />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-mode-report/:id"
            element={
              <ProtectedRoute moduleKey="AI_MODE">
                <MasterLayout>
                  <AIModeReport />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ai-rankings"
            element={
              <ProtectedRoute moduleKey="AI_MODE_RANKINGS">
                <MasterLayout>
                  <DailyRankingDashboard />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* LLM */}
          <Route
            path="/upload-llm"
            element={
              <ProtectedRoute moduleKey="ADD_LLM_PROJECT">
                <MasterLayout>
                  <UploadLLMKeywords />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/llm-projects"
            element={
              <ProtectedRoute moduleKey="LLM_PROJECTS">
                <MasterLayout>
                  <ProjectList />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* <Route
          path="/llm-dashboard"
          element={
            <ProtectedRoute moduleKey="LLM_DASHBOARD">
              <MasterLayout>
                <LLMDashboard />
              </MasterLayout>
            </ProtectedRoute>
          }
        /> */}

          <Route
            path="/llm-dashboard"
            element={
              <LLMProvider>
                <ProtectedRoute moduleKey="LLM_DASHBOARD">
                  <MasterLayout>
                    <WriteSonicDashboard />
                  </MasterLayout>
                </ProtectedRoute>
              </LLMProvider>
            }
          />

          <Route
            path="/llm-dashboard/:id"
            element={
              <ProtectedRoute moduleKey="LLM_DASHBOARD">
                <MasterLayout>
                  <WriteSonicAllCitations />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/llm-dashboard/:id/:myPage"
            element={
              <ProtectedRoute moduleKey="LLM_DASHBOARD">
                <MasterLayout>
                  <MyPagesCited />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/llm-dashboard/:id/:myPage/:myBrand"
            element={
              <ProtectedRoute moduleKey="LLM_DASHBOARD">
                <MasterLayout>
                  <BrandCitations />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/llm-dashboard/:id/thirdPartyPages"
            element={
              <ProtectedRoute moduleKey="LLM_DASHBOARD">
                <MasterLayout>
                  <ThirdPartyPages />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/llm-dashboard/:id/prompts"
            element={
              <ProtectedRoute moduleKey="LLM_DASHBOARD">
                <MasterLayout>
                  <UniquePrompts />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/llm-rankings"
            element={
              <ProtectedRoute moduleKey="LLM_RANKINGS_CHATGPT">
                <MasterLayout>
                  <DailyLLMRankingDashboard />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/llm-rankings-gemini"
            element={
              <ProtectedRoute moduleKey="LLM_RANKINGS_GEMINI">
                <MasterLayout>
                  <GeminiRankings />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/llm-rankings-perplexity"
            element={
              <ProtectedRoute moduleKey="LLM_RANKINGS_PERPLEXITY">
                <MasterLayout>
                  <PerplexityRankings />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/llm-rankings-claude"
            element={
              <ProtectedRoute moduleKey="LLM_RANKINGS_CLAUDE">
                <MasterLayout>
                  <ClaudeRankings />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* Youtube Mode */}
          <Route
            path="/upload-youtube-rank"
            element={
              <ProtectedRoute moduleKey="ADD_YOUTUBE_RANK_PROJECT">
                <MasterLayout>
                  <CreateProjects />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/youtube-projects"
            element={
              <ProtectedRoute moduleKey="YOUTUBE_PROJECTS">
                <MasterLayout>
                  <YoutubeProjectList />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/youtube-rankings"
            element={
              <ProtectedRoute moduleKey="YOUTUBE_RANKINGS">
                <MasterLayout>
                  <DailyYoutubeRankingDashboard />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* Bing Rank */}
          <Route
            path="/upload-bing-rank"
            element={
              <ProtectedRoute moduleKey="ADD_BING_RANK_PROJECT">
                <MasterLayout>
                  <BingProjects />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bing-projects"
            element={
              <ProtectedRoute moduleKey="BING_PROJECTS">
                <MasterLayout>
                  <BingProjectList />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/bing-rankings"
            element={
              <ProtectedRoute moduleKey="BING_RANKINGS">
                <MasterLayout>
                  <BingRankings />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* App Rank */}
          <Route
            path="/upload-app-rank"
            element={
              <ProtectedRoute moduleKey="ADD_APP_RANK_PROJECT">
                <MasterLayout>
                  <Projects />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/app-projects"
            element={
              <ProtectedRoute moduleKey="APP_RANK_PROJECTS">
                <MasterLayout>
                  <AppProjectList />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/app-rankings"
            element={
              <ProtectedRoute moduleKey="APP_RANK">
                <MasterLayout>
                  <DailyAppRankingDashboard />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/app-rankings-apple"
            element={
              <ProtectedRoute moduleKey="APPLE_RANK">
                <MasterLayout>
                  <DailyAppleRankingDashboard />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/unified-projects"
            element={
              <ProtectedRoute moduleKey="APP_RANK_PROJECTS">
                <MasterLayout>
                  <AppProjectList />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* Summary Dashboard */}
          <Route
            path="/summary-dashboard"
            element={
              <ProtectedRoute moduleKey="APP_RANK_PROJECTS">
                <MasterLayout>
                  <SummaryDashboard />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* Keyword Overview */}
          <Route
            path="/keyword-overview"
            element={
              <ProtectedRoute moduleKey="APP_RANK_PROJECTS">
                <MasterLayout>
                  <KeywordOverview />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* Keyword Overview */}
          <Route
            path="/serp-features-new"
            element={
              <ProtectedRoute moduleKey="APP_RANK_PROJECTS">
                <MasterLayout>
                  <SERPFeatureAnalysis />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          {/* Keyword Overview */}
          <Route
            path="/platform-rankings"
            element={
              <ProtectedRoute moduleKey="APP_RANK_PROJECTS">
                <MasterLayout>
                  <PlatformRankings />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/media-search"
            element={
              <ProtectedRoute moduleKey="APP_RANK_PROJECTS">
                <MasterLayout>
                  <MediaSearchAnalysis />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/local-geo"
            element={
              <ProtectedRoute moduleKey="APP_RANK_PROJECTS">
                <MasterLayout>
                  <LocalGeoAnalysis />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/community-results"
            element={
              <ProtectedRoute moduleKey="APP_RANK_PROJECTS">
                <MasterLayout>
                  <CommunityResults />
                </MasterLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/serp-unified"
            element={
              <ProtectedRoute moduleKey="APP_RANK_PROJECTS">
                <MasterLayout>
                  <SERPUnifiedDashboard />
                </MasterLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/ai-insights"
            element={
              <ProtectedRoute moduleKey="APP_RANK_PROJECTS">
                <MasterLayout>
                  <AIInsights />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/alerts"
            element={
              <ProtectedRoute moduleKey="APP_RANK_PROJECTS">
                <MasterLayout>
                  <AlertsView />
                </MasterLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute moduleKey="APP_RANK_PROJECTS">
                <MasterLayout>
                  <ReportsView />
                </MasterLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </ LLMProvider>


    </>
  );
}

export default App;
