"use client";

import { useEffect, useState } from "react";

import axios from "axios";

import {
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function QuizzesPage() {

  const [quizzes, setQuizzes] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [expandedQuiz, setExpandedQuiz] =
    useState(null);

  // ==========================================
  // FETCH QUIZZES
  // ==========================================
  useEffect(() => {

    fetchQuizzes();

  }, []);

  const fetchQuizzes = async () => {

    try {

      const { data } =
        await axios.get(
          "/api/quizzes"
        );

      setQuizzes(
        data.quizzes || data || []
      );

    } catch (error) {

      console.log(
        "Fetch Error:",
        error
      );

    } finally {

      setLoading(false);
    }
  };

  // ==========================================
  // DELETE QUIZ
  // ==========================================
  const deleteQuiz = async (id) => {

    const confirmDelete =
      confirm(
        "Delete this quiz permanently?"
      );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `/api/quizzes/${id}`
      );

      setQuizzes((prev) =>
        prev.filter(
          (quiz) =>
            quiz._id !== id
        )
      );

    } catch (error) {

      console.log(
        "Delete Error:",
        error
      );
    }
  };

  // ==========================================
  // SEARCH FILTER
  // ==========================================
  const filteredQuizzes =
    quizzes.filter((quiz) => {

      const title =
        quiz.quizTitle || "";

      const creator =
        quiz.creatorName || "";

      return (

        title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        creator
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );
    });

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {

    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <h1 className="text-4xl font-bold">
          Quizzes
        </h1>

        {/* SEARCH */}
        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3 text-zinc-400"
          />

          <input
            type="text"
            placeholder="Search quiz..."
            className="border rounded-xl pl-10 pr-4 py-3 w-full md:w-80 outline-none"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>
      </div>

      {/* EMPTY */}
      {filteredQuizzes.length === 0 ? (

        <div className="text-zinc-500">
          No quizzes found.
        </div>

      ) : (

        <div className="space-y-6">

          {filteredQuizzes.map(
            (quiz) => {

              const isExpanded =
                expandedQuiz ===
                quiz._id;

              return (

                <div
                  key={quiz._id}
                  className="bg-white border shadow rounded-3xl p-6"
                >

                  {/* TOP */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                    {/* LEFT */}
                    <div className="flex-1">

                      <h2 className="text-2xl font-bold">
                        {
                          quiz.quizTitle
                        }
                      </h2>

                      <p className="text-zinc-500 mt-1">
                        by{" "}
                        {
                          quiz.creatorName
                        }
                      </p>

                      {/* INFO */}
                      <div className="flex flex-wrap gap-4 mt-4 text-sm text-zinc-600">

                        <p>
                          🌍{" "}
                          {
                            quiz.location
                          }
                        </p>

                        <p>
                          🗣️{" "}
                          {
                            quiz.language
                          }
                        </p>

                        <p>
                          ❓ Questions:{" "}
                          {
                            quiz.questions
                              ?.length || 0
                          }
                        </p>

                      </div>

                      <p className="text-xs text-zinc-400 mt-4">
                        {new Date(
                          quiz.createdAt
                        ).toLocaleString()}
                      </p>

                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-2">

                      {/* EXPAND BUTTON */}
                      <button
                        onClick={() =>
                          setExpandedQuiz(
                            isExpanded
                              ? null
                              : quiz._id
                          )
                        }
                        className="border p-2 rounded-xl hover:bg-zinc-100"
                      >
                        {isExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() =>
                          deleteQuiz(
                            quiz._id
                          )
                        }
                        className="text-red-500 border border-red-200 hover:bg-red-50 p-2 rounded-xl"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>

                  </div>

                  {/* FULL QUESTIONS */}
                  {isExpanded && (

                    <div className="mt-8 border-t pt-6">

                      <h3 className="text-xl font-bold mb-6">
                        Questions
                      </h3>

                      <div className="space-y-8">

                        {quiz.questions?.map(
                          (
                            question,
                            index
                          ) => (

                            <div
                              key={index}
                              className="border rounded-2xl p-5 bg-zinc-50"
                            >

                              {/* QUESTION */}
                              <h4 className="font-bold text-lg mb-4">
                                Q{index + 1}.{" "}
                                {
                                  question.question
                                }
                              </h4>

                              {/* OPTIONS */}
                              <div className="space-y-3">

                                {question.options?.map(
                                  (
                                    option,
                                    optionIndex
                                  ) => (

                                    <div
                                      key={
                                        optionIndex
                                      }
                                      className={`p-3 rounded-xl border ${
                                        optionIndex ===
                                        question.correctAnswer
                                          ? "bg-green-100 border-green-400"
                                          : "bg-white"
                                      }`}
                                    >

                                      <span className="font-medium">
                                        {String.fromCharCode(
                                          65 +
                                            optionIndex
                                        )}
                                        .
                                      </span>{" "}
                                      {option}

                                    </div>
                                  )
                                )}

                              </div>

                              {/* CORRECT */}
                              <p className="mt-4 text-sm text-green-700 font-semibold">
                                ✅ Correct Answer:{" "}
                                {String.fromCharCode(
                                  65 +
                                    question.correctAnswer
                                )}
                              </p>

                            </div>
                          )
                        )}

                      </div>

                    </div>
                  )}

                </div>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}