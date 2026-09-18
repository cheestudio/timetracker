"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Checkbox, Input, Textarea } from "@nextui-org/react";
import { v4 as uuidv4 } from "uuid";
import moment from "moment-timezone";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";
import { useTimeEntriesContext } from "@/context/TimeEntriesContext";
import {
  supabase,
  listClients,
  timeToUTC,
  timeToSeconds,
  userTimeZone,
  today,
} from "@/lib/utils";
import { ClientDropdown } from "@/components/ClientDropdown";
import { ParsedTimeEntry, TimeEntryProps } from "@/types/types";
import {
  ArrowLeftIcon,
  CheckIcon,
  PencilIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

type ClientOption = { id: number; name: string };

export default function SubmitPage() {
  const router = useRouter();
  const { loggedIn } = useUser();
  const { addEntry } = useTimeEntriesContext();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [parsed, setParsed] = useState<ParsedTimeEntry | null>(null);
  const [autoSubmit, setAutoSubmit] = useState(true);

  // Editable fields for preview
  const [editClient, setEditClient] = useState<string>("");
  const [editDate, setEditDate] = useState<string>(today);
  const [editTask, setEditTask] = useState<string>("");
  const [editDuration, setEditDuration] = useState<string>("0:00:00");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loggedIn) {
      router.push("/");
      return;
    }
    loadClients();
  }, [loggedIn, router]);

  async function loadClients() {
    try {
      const data = await listClients();
      setClients(data.map((c: any) => ({ id: c.id, name: c.client_name })));
    } catch (err) {
      console.error("Failed to load clients:", err);
    }
  }

  async function handleParse() {
    if (!input.trim()) return;
    setLoading(true);
    setParsed(null);

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim(), clients }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to parse input");
        return;
      }

      if (autoSubmit) {
        const match = data.client
          ? clients.find(
              (client) =>
                client.name.toLowerCase() === data.client!.toLowerCase(),
            )
          : null;
        const resolvedClient = match ? String(match.id) : "1";

        setParsed(data);
        setEditClient(resolvedClient);
        setEditDate(data.date || today);
        setEditTask(data.task || "");
        setEditDuration(data.duration || "0:00:00");

        await autoSubmitEntry(data, resolvedClient);
      } else {
        setParsed(data);
        populateEditFields(data);
        toast.success("Parsed successfully");
      }
    } catch (err) {
      console.error("Parse error:", err);
      toast.error("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  function populateEditFields(data: ParsedTimeEntry) {
    if (data.client) {
      const match = clients.find(
        (client) => client.name.toLowerCase() === data.client!.toLowerCase(),
      );
      setEditClient(match ? String(match.id) : "");
    } else {
      setEditClient("1");
    }

    setEditDate(data.date || today);
    setEditTask(data.task || "");
    setEditDuration(data.duration || "0:00:00");
  }

  async function handleSubmit() {
    if (!editTask.trim()) {
      toast.error("Task is required");
      return;
    }

    setSubmitting(true);

    try {
      const totalTime = timeToSeconds(
        editDuration.split(":").slice(0, 2).join(":"),
      );
      const startTime = moment().format("h:mm A");
      const [hours, minutes, seconds] = editDuration.split(":").map(Number);
      const durationMs =
        hours * 3600000 + minutes * 60000 + (seconds || 0) * 1000;
      const endTime = moment(startTime, "h:mm A")
        .add(durationMs, "milliseconds")
        .format("h:mm A");

      const selectedClientName =
        clients.find((c) => String(c.id) === editClient)?.name || "";

      const { data: user } = await supabase.auth.getSession();

      const entryToSubmit: TimeEntryProps = {
        date: moment(editDate).tz(userTimeZone).utc().format(),
        task: editTask.trim(),
        time_tracked: totalTime,
        entry_id: uuidv4(),
        client_id: parseInt(editClient) || 0,
        client_name: selectedClientName,
        billable: true,
        owner: "Lars",
        user_id: user.session?.user.id,
        start_time: timeToUTC(startTime),
        end_time: timeToUTC(endTime),
      };

      await addEntry(entryToSubmit);
      toast.success("Time entry added");
      resetForm();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to add time entry");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setInput("");
    setParsed(null);
    setEditClient("");
    setEditDate(today);
    setEditTask("");
    setEditDuration("0:00:00");
  }

  async function autoSubmitEntry(
    data: ParsedTimeEntry,
    resolvedClient: string,
  ) {
    if (!data.task?.trim()) {
      toast.error("Task is required");
      setParsed(data);
      populateEditFields(data);
      return;
    }

    setSubmitting(true);

    try {
      const duration = data.duration || "0:00:00";
      const totalTime = timeToSeconds(
        duration.split(":").slice(0, 2).join(":"),
      );
      const startTime = moment().format("h:mm A");
      const [hours, minutes, seconds] = duration.split(":").map(Number);
      const durationMs =
        hours * 3600000 + minutes * 60000 + (seconds || 0) * 1000;
      const endTime = moment(startTime, "h:mm A")
        .add(durationMs, "milliseconds")
        .format("h:mm A");

      const selectedClientName =
        clients.find((c) => String(c.id) === resolvedClient)?.name || "";

      const { data: user } = await supabase.auth.getSession();

      const entryToSubmit: TimeEntryProps = {
        date: moment(data.date || today)
          .tz(userTimeZone)
          .utc()
          .format(),
        task: data.task!.trim(),
        time_tracked: totalTime,
        entry_id: uuidv4(),
        client_id: parseInt(resolvedClient) || 0,
        client_name: selectedClientName,
        billable: true,
        owner: "Lars",
        user_id: user.session?.user.id,
        start_time: timeToUTC(startTime),
        end_time: timeToUTC(endTime),
      };

      await addEntry(entryToSubmit);
      toast.success("Time entry added");
      resetForm();
    } catch (err) {
      console.error("Auto-submit error:", err);
      toast.error("Failed to add time entry");
      setParsed(data);
      populateEditFields(data);
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleParse();
    }
    if (e.key === " " && (e.ctrlKey || e.metaKey) && parsed) {
      handleSubmit();
    }
    if (e.key === "Escape" && parsed) {
      setParsed(null);
    }
  }

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditClient(e.target.value);
  };

  return (
    <main
      className="px-4 md:px-12 py-8 max-w-2xl mx-auto"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="flat"
          onPress={() => router.push("/timesheets/?client=0")}
        >
          <ArrowLeftIcon className="w-5 h-5" />
          View Timesheets
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-5">Add Entry</h1>
      {!parsed ? (
        /* ── Input Mode ── */
        <div className="space-y-4">
          <Textarea
            radius="sm"
            variant="bordered"
            label="Describe your time entry"
            labelPlacement="outside"
            placeholder={'e.g. "worked on WordPress blocks for two hours"'}
            minRows={4}
            maxRows={8}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-default-400">Ctrl+Enter to parse</p>
            <div className="flex items-center gap-3">
              <Checkbox
                isSelected={autoSubmit}
                onValueChange={setAutoSubmit}
                size="sm"
              >
                Auto-submit
              </Checkbox>
              <Button
                color="primary"
                onPress={handleParse}
                isLoading={loading}
                isDisabled={!input.trim()}
              >
                {loading ? "Processing..." : "Process"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Preview / Edit Mode ── */
        <div className="space-y-5">
          <div className="p-4 rounded-lg bg-content2 border border-content3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Processed Entry</h2>
              <Button
                size="sm"
                variant="light"
                startContent={<PencilIcon className="w-4 h-4" />}
                onPress={() => setParsed(null)}
              >
                Edit Input
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ClientDropdown
                client={editClient}
                handleClient={handleClientChange}
              />

              <Input
                radius="sm"
                variant="bordered"
                label="Duration"
                labelPlacement="outside"
                placeholder="HH:MM:SS"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
              />

              <Input
                radius="sm"
                variant="bordered"
                label="Task"
                labelPlacement="outside"
                placeholder="What did you work on?"
                value={editTask}
                onChange={(e) => setEditTask(e.target.value)}
                autoFocus
              />

              <Input
                radius="sm"
                variant="bordered"
                label="Date"
                labelPlacement="outside"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="light"
              startContent={<ArrowPathIcon className="w-4 h-4" />}
              onPress={resetForm}
            >
              Clear
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={submitting}
              startContent={!submitting && <CheckIcon className="w-4 h-4" />}
            >
              {submitting ? "Submitting..." : "Submit Entry"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
