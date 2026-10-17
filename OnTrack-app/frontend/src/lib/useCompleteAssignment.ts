// Optimistic "complete" tap: the card ticks instantly, a "+30 XP" toast shows,
// and the change rolls back if the request fails.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../components/Toast";
import { completeAssignment } from "./api";
import type { Assignment, HomeResponse } from "./types";

export function useCompleteAssignment() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (assignment: Assignment) => completeAssignment(assignment.id),
    onMutate: async (assignment) => {
      toast(`+${assignment.xp} XP`);
      await queryClient.cancelQueries({ queryKey: ["assignments"] });
      await queryClient.cancelQueries({ queryKey: ["home"] });
      const previousLists = queryClient.getQueriesData<Assignment[]>({ queryKey: ["assignments"] });
      const previousHome = queryClient.getQueryData<HomeResponse>(["home"]);

      queryClient.setQueriesData<Assignment[]>({ queryKey: ["assignments"] }, (list) =>
        list?.map((a) => (a.id === assignment.id ? { ...a, status: "done" } : a)),
      );
      queryClient.setQueryData<HomeResponse>(["home"], (home) =>
        home && { ...home, my_due: home.my_due.filter((a) => a.id !== assignment.id) },
      );
      return { previousLists, previousHome };
    },
    onError: (_error, _assignment, context) => {
      context?.previousLists.forEach(([key, data]) => queryClient.setQueryData(key, data));
      queryClient.setQueryData(["home"], context?.previousHome);
      toast("Couldn't complete that, try again");
    },
    onSettled: () => queryClient.invalidateQueries(),
  });
}
