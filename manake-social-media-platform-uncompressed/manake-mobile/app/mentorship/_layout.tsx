import { Stack } from "expo-router";

export default function MentorshipLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#7c3aed",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="discover"
        options={{
          title: "Find a Mentor",
        }}
      />
      <Stack.Screen
        name="my"
        options={{
          title: "My Mentorships",
        }}
      />
    </Stack>
  );
}
