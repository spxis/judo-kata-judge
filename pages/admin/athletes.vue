<template>
  <Error :error-string="error" />
  <AdminNav name="Athletes" />
  <Container>
    <ActionBar>
      <button class="btn btn-secondary" @click.prevent="showAdd" :disabled="inAction">
        <span>Add Athlete</span>
      </button>
    </ActionBar>
    <table class="admin-table">
      <thead>
        <tr>
          <th class="w-12">ID</th>
          <th>Name</th>
          <th>Rank</th>
          <th>Region</th>
          <th class="w-16"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in athletes">
          <td>{{ a.id }}</td>
          <td>{{ a.name }}</td>
          <td>{{ getRankName(a.rank) }}</td>
          <td>{{ getProvinceName(a.region) }}</td>
          <td>
            <div class="join">
              <button class="btn btn-secondary btn-square btn-sm join-item" @click.prevent="showUpdate(a)"
                :disabled="inAction">
                <PencilIcon class="w-4 h-4" />
              </button>
              <button class="btn btn-error btn-square btn-sm join-item" @click.prevent="showRemove(a.id)"
                :disabled="inAction">
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </Container>
  <Prompt name="add_athlete_modal" @submit="add" :disabled="inAction" text="Add">
    <AthleteInputs :athlete="newAthlete" />
  </Prompt>
  <Prompt name="edit_athlete_modal" @submit="update" :disabled="inAction" text="Update">
    <AthleteInputs :athlete="athleteToUpdate" />
  </Prompt>
  <Prompt name="delete_athlete_modal" @submit="remove" text="Yes">
    <span>Delete this athlete?</span>
  </Prompt>
</template>

<script setup>
import { clone, pick } from 'lodash-es';
import { XMarkIcon, PencilIcon } from '@heroicons/vue/24/outline';
import { getProvinceName, getRankName, handleServerError } from '~/src/utils';

const DEFAULT = { name: '', region: 'on', rank: '1d' };

const cookie = useCookie('jkj', { default: () => ({}) });

const error = useState('error', () => '');
const athletes = useState('athletes', () => ({}));
const inAction = useState('in-action', () => false);
const newAthlete = useState('new-athlete', () => clone(DEFAULT));
const athleteToDelete = useState('athlete-to-delete', () => undefined);
const athleteToUpdate = useState('athlete-to-update', () => clone(DEFAULT));

const headers = { authorization: `Bearer ${cookie.value.adminCode}` };

try {
  inAction.value = true;
  athletes.value = await $fetch(`/api/athletes`, { headers });
  error.value = '';
} catch (err) {
  error.value = handleServerError(err);
} finally {
  inAction.value = false;
}

async function showAdd() {
  add_athlete_modal.showModal();
}

async function add() {
  inAction.value = true;
  try {
    const body = newAthlete.value;
    const result = await $fetch(`/api/athletes`, { method: 'POST', body, headers });
    athletes.value.push(result);
    newAthlete.value = clone(DEFAULT);
    error.value = '';
  } catch (err) {
    error.value = handleServerError(err);
  } finally {
    inAction.value = false;
  }
}

function showUpdate(athlete) {
  athleteToUpdate.value = clone(athlete);
  athleteToUpdate.value.originalAthlete = athlete;
  edit_athlete_modal.showModal();
}

async function update() {
  try {
    const id = athleteToUpdate.value.id;
    const body = pick(athleteToUpdate.value, ["name", "rank", "region"]);
    const result = await $fetch(`/api/athletes/${id}`, { method: 'POST', body, headers });
    const originalAthlete = athleteToUpdate.value.originalAthlete;
    originalAthlete.name = result.name;
    originalAthlete.rank = result.rank;
    originalAthlete.region = result.region;
    athleteToUpdate.value = clone(DEFAULT);
    error.value = '';
  } catch (err) {
    error.value = handleServerError(err);
  } finally {
    inAction.value = false;
  }
}

async function showRemove(id) {
  athleteToDelete.value = id;
  delete_athlete_modal.showModal();
}

async function remove() {
  if (athleteToDelete.value) {
    const id = athleteToDelete.value;
    try {
      inAction.value = true;
      athletes.value = await $fetch(`/api/athletes/${id}`, { method: 'DELETE', headers });
      error.value = '';
      athleteToDelete.value = undefined;
    } catch (err) {
      error.value = handleServerError(err);
    } finally {
      inAction.value = false;
    }
  }
}
</script>
