import { useMemo } from "react";
import { InterviewQuestion } from "../types";

interface UseFilteredQuestionsProps {
  questions: InterviewQuestion[];
  searchQuery: string;
  selectedCategories: string[];
  sortBy: "newest" | "votes" | "company";
}

export function useFilteredQuestions({
  questions,
  searchQuery,
  selectedCategories,
  sortBy,
}: UseFilteredQuestionsProps) {
  return useMemo(() => {
    const filtered = questions?.filter((question) => {
      const searchMatch =
        searchQuery === "" ||
        question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.category.toLowerCase().includes(searchQuery.toLowerCase());
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(question.category);
      return searchMatch && categoryMatch;
    });
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "votes":
          return b.votes - a.votes;
        case "company":
          return a.company.localeCompare(b.company);
        case "newest":
        default:
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
      }
    });
    return filtered;
  }, [questions, searchQuery, selectedCategories, sortBy]);
}
