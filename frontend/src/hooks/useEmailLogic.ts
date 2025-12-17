import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchEmails,
  fetchMailboxes,
  fetchEmailDetail,
  modifyEmail,
  snoozeEmail as apiSnoozeEmail,
  fetchSnoozedEmails,
  findLabelId,
  searchEmails,
} from "@/services/apiService";
import { type Email } from "@/data/mockData";

interface UseEmailLogicProps {
  selectedFolder: string;
  selectedEmailId: string | null;
  viewMode: "list" | "kanban";
  searchQuery: string;
}

export const useEmailLogic = ({
  selectedFolder,
  selectedEmailId,
  viewMode,
  searchQuery,
}: UseEmailLogicProps) => {
  const queryClient = useQueryClient();
  const limit = 10;

  // 1. Fetch Emails
  const {
    data: emailsInfiniteData,
    isLoading: isLoadingList,
    fetchNextPage: fetchNextList,
    hasNextPage: hasNextList,
    isFetchingNextPage: isFetchingNextList,
  } = useInfiniteQuery({
    queryKey: ["emails", selectedFolder, searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      fetchEmails(
        selectedFolder,
        pageParam as string | number,
        limit,
        searchQuery
      ),
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    initialPageParam: 1 as string | number,
    refetchOnWindowFocus: false,
    retry: 1,
    refetchInterval: 60000,
  });

  const emails = emailsInfiniteData?.pages.flatMap((page) => page.emails) || [];

  const { data: folders = [] } = useQuery<
    { id: string; label: string; icon: string }[]
  >({
    queryKey: ["mailboxes"],
    queryFn: fetchMailboxes,
    refetchOnWindowFocus: false,
  });

  const todoLabelId = findLabelId(folders, "TODO");
  const doneLabelId = findLabelId(folders, "DONE");

  // 2. Fetch Selected Email Detail
  const { data: selectedEmail = null, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["email", selectedEmailId],
    queryFn: () => fetchEmailDetail(selectedEmailId!),
    enabled: !!selectedEmailId,
    refetchOnWindowFocus: false,
  });

  // 3. Fetch Kanban Emails (Infinite Queries)
  // const limit = 10; // Moved up

  const {
    data: inboxData,
    fetchNextPage: fetchNextInbox,
    hasNextPage: hasNextInbox,
    isFetchingNextPage: isFetchingNextInbox,
  } = useInfiniteQuery({
    queryKey: ["kanban", "inbox"],
    queryFn: ({ pageParam = 1 }) =>
      fetchEmails("INBOX", pageParam as string | number, limit),
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    enabled: viewMode === "kanban",
    initialPageParam: 1 as string | number,
    refetchInterval: 60000,
  });

  const {
    data: todoData,
    fetchNextPage: fetchNextTodo,
    hasNextPage: hasNextTodo,
    isFetchingNextPage: isFetchingNextTodo,
  } = useInfiniteQuery({
    queryKey: ["kanban", "todo", todoLabelId],
    queryFn: ({ pageParam = 1 }) =>
      fetchEmails(todoLabelId!, pageParam as string | number, limit),
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    enabled: viewMode === "kanban" && !!todoLabelId,
    initialPageParam: 1 as string | number,
    refetchInterval: 60000,
  });

  const {
    data: doneData,
    fetchNextPage: fetchNextDone,
    hasNextPage: hasNextDone,
    isFetchingNextPage: isFetchingNextDone,
  } = useInfiniteQuery({
    queryKey: ["kanban", "done", doneLabelId],
    queryFn: ({ pageParam = 1 }) =>
      fetchEmails(doneLabelId!, pageParam as string | number, limit),
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    enabled: viewMode === "kanban" && !!doneLabelId,
    initialPageParam: 1 as string | number,
    refetchInterval: 60000,
  });

  const {
    data: snoozeData,
    fetchNextPage: fetchNextSnooze,
    hasNextPage: hasNextSnooze,
    isFetchingNextPage: isFetchingNextSnooze,
  } = useInfiniteQuery({
    queryKey: ["kanban", "snoozed"],
    queryFn: ({ pageParam = 1 }) =>
      fetchSnoozedEmails(pageParam as number, limit),
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    enabled: viewMode === "kanban",
    initialPageParam: 1 as number,
    refetchInterval: 60000,
  });

  // Flatten data
  const inboxEmails =
    inboxData?.pages
      .flatMap((page) => page.emails)
      .map((e) => ({ ...e, folder: "inbox" })) || [];
  const todoEmails =
    todoData?.pages
      .flatMap((page) => page.emails)
      .map((e) => ({ ...e, folder: "todo" })) || [];
  const doneEmails =
    doneData?.pages
      .flatMap((page) => page.emails)
      .map((e) => ({ ...e, folder: "done" })) || [];
  const snoozedEmails =
    snoozeData?.pages
      .flatMap((page) => page.emails)
      .map((e) => ({ ...e, folder: "snoozed" })) || [];

  // 4. Search Emails
  const {
    data: searchResults = [],
    isLoading: isLoadingSearch,
    error: searchError,
  } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => searchEmails(searchQuery),
    enabled: !!searchQuery,
    refetchOnWindowFocus: false,
  });

  // 5. Mutations
  const modifyEmailMutation = useMutation({
    mutationFn: ({
      id,
      addLabels,
      removeLabels,
    }: {
      id: string;
      addLabels: string[];
      removeLabels: string[];
      meta?: { destinationFolder: string; sourceFolder?: string };
    }) => modifyEmail(id, addLabels, removeLabels),
    onMutate: async ({ id, addLabels, removeLabels, meta }) => {
      await queryClient.cancelQueries({ queryKey: ["emails", selectedFolder] });

      const previousEmails = queryClient.getQueryData([
        "emails",
        selectedFolder,
      ]);
      let previousEmailDetail = queryClient.getQueryData(["email", id]);

      // Try to seed from list if detail is missing
      if (!previousEmailDetail) {
        const listData = queryClient.getQueryData<
          InfiniteData<{ emails: Email[] }>
        >(["emails", selectedFolder]);
        if (listData?.pages) {
          for (const page of listData.pages) {
            const found = page.emails.find((e) => e.id === id);
            if (found) {
              previousEmailDetail = found;
              queryClient.setQueryData(["email", id], found);
              break;
            }
          }
        }
      }

      // Kanban Optimistic Update Context
      let previousSource: InfiniteData<any> | undefined;
      let previousDest: InfiniteData<any> | undefined;
      let sourceQueryKey: any[] | undefined;
      let destQueryKey: any[] | undefined;

      if (meta?.destinationFolder && meta?.sourceFolder) {
        const getQueryKey = (folder: string) => {
          if (folder === "inbox") return ["kanban", "inbox"];
          if (folder === "todo") return ["kanban", "todo", todoLabelId];
          if (folder === "done") return ["kanban", "done", doneLabelId];
          if (folder === "snoozed") return ["kanban", "snoozed"];
          return undefined;
        };

        sourceQueryKey = getQueryKey(meta.sourceFolder);
        destQueryKey = getQueryKey(meta.destinationFolder);

        if (sourceQueryKey && destQueryKey) {
          await queryClient.cancelQueries({ queryKey: sourceQueryKey });
          await queryClient.cancelQueries({ queryKey: destQueryKey });

          previousSource = queryClient.getQueryData(sourceQueryKey);
          previousDest = queryClient.getQueryData(destQueryKey);

          let movedEmail: Email | undefined;

          // Remove from source
          queryClient.setQueryData(sourceQueryKey, (old: any) => {
            if (!old) return old;
            const newPages = old.pages.map((page: any) => {
              const found = page.emails.find((e: Email) => e.id === id);
              if (found) movedEmail = found;
              return {
                ...page,
                emails: page.emails.filter((e: Email) => e.id !== id),
              };
            });
            return { ...old, pages: newPages };
          });

          // Add to destination
          if (movedEmail) {
            queryClient.setQueryData(destQueryKey, (old: any) => {
              if (!old) return old;
              const newPages = [...old.pages];
              if (newPages.length > 0) {
                newPages[0] = {
                  ...newPages[0],
                  emails: [movedEmail, ...newPages[0].emails],
                };
              }
              return { ...old, pages: newPages };
            });
          }
        }
      }

      if (previousEmailDetail) {
        await queryClient.cancelQueries({ queryKey: ["email", id] });
      }

      queryClient.setQueryData(["emails", selectedFolder], (old: any) => {
        if (!old) return old;

        // Helper to update a single email
        const updateEmail = (email: any) => {
          if (email.id === id) {
            let isRead = email.isRead;
            let isStarred = email.isStarred;

            if (addLabels.includes("UNREAD")) isRead = false;
            if (removeLabels.includes("UNREAD")) isRead = true;
            if (addLabels.includes("STARRED")) isStarred = true;
            if (removeLabels.includes("STARRED")) isStarred = false;

            return { ...email, isRead, isStarred };
          }
          return email;
        };

        // Handle { emails: [...] } structure
        if (old.emails && Array.isArray(old.emails)) {
          return {
            ...old,
            emails: old.emails.map(updateEmail),
          };
        }

        // Handle array structure (fallback)
        if (Array.isArray(old)) {
          return old.map(updateEmail);
        }

        return old;
      });

      if (previousEmailDetail) {
        queryClient.setQueryData(["email", id], (old: any) => {
          if (!old) return old;
          let isRead = old.isRead;
          let isStarred = old.isStarred;

          if (addLabels.includes("UNREAD")) isRead = false;
          if (removeLabels.includes("UNREAD")) isRead = true;
          if (addLabels.includes("STARRED")) isStarred = true;
          if (removeLabels.includes("STARRED")) isStarred = false;

          return { ...old, isRead, isStarred };
        });
      }

      return {
        previousEmails,
        previousEmailDetail,
        previousSource,
        previousDest,
        sourceQueryKey,
        destQueryKey,
      };
    },
    onError: (_err, newTodo, context) => {
      console.error("Mutation failed:", _err);
      if (context?.previousEmails) {
        queryClient.setQueryData(
          ["emails", selectedFolder],
          context.previousEmails
        );
      }
      if (context?.previousEmailDetail) {
        queryClient.setQueryData(
          ["email", newTodo.id],
          context.previousEmailDetail
        );
      }
      if (context?.sourceQueryKey && context?.previousSource) {
        queryClient.setQueryData(
          context.sourceQueryKey,
          context.previousSource
        );
      }
      if (context?.destQueryKey && context?.previousDest) {
        queryClient.setQueryData(context.destQueryKey, context.previousDest);
      }
      toast.error("Failed to update email");
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["emails", selectedFolder] });
      queryClient.invalidateQueries({ queryKey: ["kanban"] });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ["email", variables.id] });
      }
    },
  });

  const snoozeEmailMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: Date }) =>
      apiSnoozeEmail(id, date.toISOString()),
    onSuccess: (data) => {
      console.log("Snooze success:", data.status, data.wakeUpTime);
      toast.success("Email snoozed");
      queryClient.invalidateQueries({ queryKey: ["kanban"] });
    },
    onError: () => {
      toast.error("Failed to snooze email");
    },
  });

  // 5. Helper Functions

  const moveEmail = (
    emailId: string,
    destinationFolder: string,
    sourceFolder?: string
  ) => {
    const addLabels: string[] = [];
    const removeLabels: string[] = [];

    // Dynamic IDs
    const todoId = todoLabelId || "STARRED"; // Fallback
    // For DONE, if we don't have an ID, we might fail or just not add anything.
    // But let's assume if it's missing, we can't move to it properly.
    const doneId = doneLabelId;

    if (destinationFolder === "todo") {
      addLabels.push(todoId);
      removeLabels.push("INBOX");
      if (doneId) removeLabels.push(doneId);
    } else if (destinationFolder === "inbox") {
      addLabels.push("INBOX");
      if (todoLabelId) removeLabels.push(todoLabelId);
      // Also remove STARRED if it was the fallback
      if (!todoLabelId) removeLabels.push("STARRED");
      if (doneId) removeLabels.push(doneId);
    } else if (destinationFolder === "done") {
      if (doneId) addLabels.push(doneId);
      removeLabels.push("INBOX");
      if (todoLabelId) removeLabels.push(todoLabelId);
      if (!todoLabelId) removeLabels.push("STARRED");
    }

    modifyEmailMutation.mutate({
      id: emailId,
      addLabels,
      removeLabels,
      meta: { destinationFolder, sourceFolder },
    });
  };

  const snoozeEmail = (emailId: string, date: Date, sourceFolder?: string) => {
    snoozeEmailMutation.mutate({ id: emailId, date });

    if (sourceFolder) {
      const removeLabels: string[] = [];
      if (sourceFolder === "inbox") removeLabels.push("INBOX");
      if (sourceFolder === "todo" && todoLabelId)
        removeLabels.push(todoLabelId);
      if (sourceFolder === "done" && doneLabelId)
        removeLabels.push(doneLabelId);

      if (removeLabels.length > 0) {
        modifyEmailMutation.mutate({
          id: emailId,
          addLabels: [],
          removeLabels,
          meta: { destinationFolder: "snoozed", sourceFolder },
        });
      }
    }
  };

  // Redefining executeEmailAction to be more robust
  const handleEmailAction = (
    action: "toggleRead" | "delete" | "star" | "markAsRead",
    payload: { id: string; email?: Email | null }
  ) => {
    const { id, email } = payload;
    const addLabels: string[] = [];
    const removeLabels: string[] = [];
    let successMessage = "";

    switch (action) {
      case "toggleRead":
        if (email?.isRead) {
          addLabels.push("UNREAD");
          successMessage = "Marked as unread";
        } else {
          removeLabels.push("UNREAD");
          successMessage = "Marked as read";
        }
        break;
      case "markAsRead":
        removeLabels.push("UNREAD");
        break;
      case "delete":
        addLabels.push("TRASH");
        removeLabels.push("INBOX");
        successMessage = "Moved to trash";
        break;
      case "star":
        if (email?.isStarred) {
          removeLabels.push("STARRED");
          successMessage = "Removed from starred";
        } else {
          addLabels.push("STARRED");
          successMessage = "Marked as starred";
        }
        break;
    }

    modifyEmailMutation.mutate(
      {
        id,
        addLabels,
        removeLabels,
      },
      {
        onSuccess: () => {
          if (successMessage) toast.success(successMessage);
        },
      }
    );
  };

  return {
    emails,
    fetchNextList,
    hasNextList,
    isFetchingNextList,
    folders,
    kanbanData: {
      inbox: {
        emails: inboxEmails,
        fetchNextPage: fetchNextInbox,
        hasNextPage: hasNextInbox,
        isFetchingNextPage: isFetchingNextInbox,
      },
      todo: {
        emails: todoEmails,
        fetchNextPage: fetchNextTodo,
        hasNextPage: hasNextTodo,
        isFetchingNextPage: isFetchingNextTodo,
      },
      done: {
        emails: doneEmails,
        fetchNextPage: fetchNextDone,
        hasNextPage: hasNextDone,
        isFetchingNextPage: isFetchingNextDone,
      },
      snoozed: {
        emails: snoozedEmails,
        fetchNextPage: fetchNextSnooze,
        hasNextPage: hasNextSnooze,
        isFetchingNextPage: isFetchingNextSnooze,
      },
    },
    selectedEmail,
    isLoadingList,
    isLoadingKanban: false,
    isLoadingDetail,
    moveEmail,
    snoozeEmail,
    executeEmailAction: handleEmailAction,
    searchResults,
    isLoadingSearch,
    searchError,
  };
};
