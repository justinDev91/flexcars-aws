"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetAllVehicles } from "@/app/(authed)/home/vehicle/hooks/useGetAllVehicles";
import { Container, Card, Title, Text, Badge, Group, Button, Divider, Loader, Image, Stack } from "@mantine/core";
import { IconArrowLeft, IconCar, IconMapPin, IconGasStation, IconUsers, IconSettings } from "@tabler/icons-react";

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { vehicles, isVehiclesLoading } = useGetAllVehicles();
  const vehicleId = params?.id as string;
  const vehicle = vehicles.find((v) => v.id === vehicleId);

  if (isVehiclesLoading) {
    return (
      <Container size="md" py="xl">
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      </Container>
    );
  }

  if (!vehicle) {
    return (
      <Container size="md" py="xl">
        <Card withBorder className="text-center">
          <Title order={3} className="mb-2">Vehicle Not Found</Title>
          <Text color="dimmed">The vehicle you are looking for does not exist.</Text>
          <Button mt="md" leftSection={<IconArrowLeft size={18} />} onClick={() => router.back()}>
            Back
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Card shadow="lg" radius="lg" p="lg" className="bg-white border border-gray-100">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex justify-center items-center">
            <Image
              src={vehicle.imageUrl}
              alt={`${vehicle.brand} ${vehicle.model}`}
              radius="md"
              className="w-full max-w-xs h-64 object-cover shadow-md border"
            />
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <Group justify="space-between" align="center">
              <Title order={2} className="text-gray-800">
                {vehicle.brand} {vehicle.model}
              </Title>
              <Badge color="blue" size="lg" variant="filled">
                {vehicle.status}
              </Badge>
            </Group>
            <Text size="lg" color="dimmed">
              Plate: <span className="font-semibold text-gray-700">{vehicle.plateNumber}</span>
            </Text>
            <Divider my="sm" />
            <Stack gap="xs">
              <Group gap="sm">
                <IconMapPin size={20} className="text-blue-500" />
                <Text>Location: <span className="font-semibold">{vehicle.location || 'N/A'}</span></Text>
              </Group>
              <Group gap="sm">
                <IconGasStation size={20} className="text-green-500" />
                <Text>Fuel: <span className="font-semibold">{vehicle.fuelType}</span></Text>
              </Group>
              <Group gap="sm">
                <IconSettings size={20} className="text-gray-500" />
                <Text>Transmission: <span className="font-semibold">{vehicle.transmission || 'N/A'}</span></Text>
              </Group>
              <Group gap="sm">
                <IconUsers size={20} className="text-purple-500" />
                <Text>Seats: <span className="font-semibold">{vehicle.seatingCapacity || 'N/A'}</span></Text>
              </Group>
              <Group gap="sm">
                <Text>Mileage: <span className="font-semibold">{vehicle.currentMileage} km</span></Text>
              </Group>
              <Group gap="sm">
                <IconCar size={20} className="text-gray-700" />
                <Text>Year: <span className="font-semibold">{vehicle.year}</span></Text>
              </Group>
            </Stack>
            <Divider my="sm" />
            <Group gap="md">
              <Button
                size="md"
                color="blue"
                radius="md"
                onClick={() => router.push(`/home/reservation/create?vehicleId=${vehicle.id}`)}
              >
                Reserve Now
              </Button>
              <Button
                size="md"
                variant="outline"
                color="gray"
                radius="md"
                leftSection={<IconArrowLeft size={18} />}
                onClick={() => router.back()}
              >
                Back
              </Button>
            </Group>
          </div>
        </div>
      </Card>
    </Container>
  );
}
