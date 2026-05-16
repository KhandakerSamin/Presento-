import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Group } from "@/types";

export function useGroups(sectionId: string) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    const fetchGroups = async () => {
      const { data } = await supabase
        .from("groups")
        .select("*, students(*)")
        .eq("section_id", sectionId)
        .order("group_number");
      if (data) setGroups(data);
      setLoading(false);
    };

    fetchGroups();

    // Realtime subscription
    const channel = supabase
      .channel(`groups:${sectionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "groups", filter: `section_id=eq.${sectionId}` },
        () => fetchGroups()   // Re-fetch on any change
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        () => fetchGroups()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sectionId]);

  return { groups, loading };
}