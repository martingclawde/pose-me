import type { SelectedPoseRepository } from '../../../../src/application/ports/selected-pose-repository';
import { GetSelectedPoseCardUseCase } from '../../../../src/application/use-cases/get-selected-pose-card.use-case';

class InMemorySelectedPoseRepository implements SelectedPoseRepository {
  constructor(private selectedPoseCardId: string | null) {}

  async saveSelectedPoseCardId(poseCardId: string): Promise<void> {
    this.selectedPoseCardId = poseCardId;
  }

  async getSelectedPoseCardId(): Promise<string | null> {
    return this.selectedPoseCardId;
  }
}

describe('GetSelectedPoseCardUseCase', () => {
  it('returns current selected pose card id when available', async () => {
    const repository = new InMemorySelectedPoseRepository('pose_007');
    const useCase = new GetSelectedPoseCardUseCase(repository);

    await expect(useCase.execute()).resolves.toBe('pose_007');
  });

  it('returns null when there is no selected pose card id', async () => {
    const repository = new InMemorySelectedPoseRepository(null);
    const useCase = new GetSelectedPoseCardUseCase(repository);

    await expect(useCase.execute()).resolves.toBeNull();
  });
});
