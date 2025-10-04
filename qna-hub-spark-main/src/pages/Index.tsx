import { useState, useEffect } from "react";
import { InterviewQuestion } from "../types";
import { InterviewQuestionDetail } from "../components/InterviewQuestionDetail";
import { useFilteredQuestions } from "../hooks/useFilteredQuestions";
import { IndexHeader } from "../components/IndexHeader";
import { IndexSearchSortBar } from "../components/IndexSearchSortBar";
import { IndexSidebarFilters } from "../components/IndexSidebarFilters";
import { IndexQuestionsList } from "../components/IndexQuestionsList";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { questionsApi } from "../lib/api";
import { useUserProfile } from "@/hooks/useProfile";
import { useQuestions } from "@/hooks/useQuestions";

const Index = () => {
  const queryClient = useQueryClient();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "votes" | "company">(
    "newest"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [initialValues, setInitialValues] =
    useState<Partial<InterviewQuestion> | null>({});
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cursorStack, setCursorStack] = useState<string[]>([]); // history stack
  // Auth state
  const { user } = useUserProfile();
  const isAuthenticated = !!user?.data?.id;

  const {
    allQuestions,
    allIsLoading: isLoading,
    allIsError: isError,
    allError: error,
    addQuestionMutation,
    upvoteMutation,
    downvoteMutation,
    bookmarkMutation,
    getCategories,
  } = useQuestions({
    searchQuery,
    selectedCategories,
    sortBy,
    cursor,
  });
  const questions = allQuestions?.data || [];
  const nextCursor = allQuestions?.nextCursor || null;
  const hasMore = allQuestions?.hasMore || false;
  const generateWithAIMutation = useMutation({
    mutationFn: questionsApi.generateWithAI,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      console.log("AI generated question:", data);
      setInitialValues(data.question);
      setOpen(true);
    },
  });
  console.log("page: ", page);
  const handlePagination = (dir: "next" | "prev") => {
    if (dir === "next" && nextCursor) {
      setCursorStack((stack) => [...stack, cursor]); // push current cursor (even null)
      setCursor(nextCursor);
      setPage((p) => p + 1);
    } else if (dir === "prev") {
      setCursorStack((stack) => {
        if (stack.length === 0) return stack; // nothing to do
        const newStack = [...stack];
        const prevCursor = newStack.pop() as string | null; // popped cursor (could be null)
        setCursor(prevCursor ?? null);
        setPage((p) => Math.max(1, p - 1));
        return newStack;
      });
    }
  };
  console.log("selectedCategories",selectedCategories)
  const filteredQuestions = useFilteredQuestions({
    questions,
    searchQuery,
    selectedCategories,
    sortBy,
  });

  useEffect(() => {
    setCursor(null);
    setCursorStack([]);
    setPage(1);
  }, [searchQuery, selectedCategories, sortBy]);

  const selectedQuestion = selectedQuestionId
    ? questions.find((q: InterviewQuestion) => q._id === selectedQuestionId)
    : null;

  // Handlers
  const handleVote = (questionId: string, direction: "up" | "down") => {
    if (!isAuthenticated) {
      return;
    }
    if (direction === "up") {
      upvoteMutation.mutate(questionId);
    } else {
      downvoteMutation.mutate(questionId);
    }
  };

  const handleBookmark = (questionId: string) => {
    if (!isAuthenticated) {
      return;
    }
    bookmarkMutation.mutate(questionId);
  };

  const handleAddQuestion = (
    newQuestionData: Omit<
      InterviewQuestion,
      "id" | "author" | "timestamp" | "votes" | "bookmarked" | "views"
    >
  ) => {
    if (!isAuthenticated) {
      return false;
    }
    addQuestionMutation.mutate(newQuestionData);
    setSearchQuery("");
    return true;
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
  };

  if (selectedQuestion) {
    return (
      <InterviewQuestionDetail
        question={selectedQuestion}
        onVote={handleVote}
        onBookmark={handleBookmark}
        onBack={() => setSelectedQuestionId(null)}
        userId={user?.data?.id}
      />
    );
  }

  const handleGenerateWithAI = () => {
    // Placeholder for AI generation logic
    generateWithAIMutation.mutate(searchQuery);
  };
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <IndexHeader
            onAddQuestion={handleAddQuestion}
            initialValues={initialValues}
            open={open}
            setOpen={setOpen}
          />
          <IndexSearchSortBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <IndexSidebarFilters
            selectedCategories={selectedCategories}
            availableCategories={getCategories || []}
            onCategoryToggle={handleCategoryToggle}
            onClearFilters={handleClearFilters}
            showFilters={showFilters}
          />
          <div className="flex-1">
            {isLoading ? (
              <div className="p-8 text-center">Loading questions...</div>
            ) : isError ? (
              <div className="p-8 text-center text-destructive">
                Error loading questions: {String(error)}
              </div>
            ) : (
              <IndexQuestionsList
                filteredQuestions={filteredQuestions}
                handleVote={handleVote}
                handleBookmark={handleBookmark}
                handleClearFilters={handleClearFilters}
                setSelectedQuestionId={setSelectedQuestionId}
                setQuestions={() => {}}
                generateWithAI={handleGenerateWithAI}
                AIThinking={generateWithAIMutation}
              />
            )}
            <div className="mt-4 flex justify-center gap-4">
              <button
                className={`*:flex  items-center gap-2 py-2 px-4 rounded bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105
                 ${
                   cursorStack.length === 0
                     ? " cursor-not-allowed opacity-50"
                     : ""
                 }
                  `}
                disabled={cursorStack.length === 0}
                onClick={() => handlePagination("prev")}
              >
                Prev
              </button>
              <span className="flex items-center font-semibold">
                Page {page}
              </span>
              <button
                className={`flex items-center gap-2 py-2 px-4 rounded  bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 *:
                  ${!hasMore ? " cursor-not-allowed opacity-50" : ""}
                  `}
                disabled={!hasMore}
                onClick={() => handlePagination("next")}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
