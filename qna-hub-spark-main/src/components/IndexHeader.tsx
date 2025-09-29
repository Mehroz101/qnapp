import  AddInterviewQuestionDialog  from './AddInterviewQuestionDialog';

interface IndexHeaderProps {
  readonly onAddQuestion: (data: unknown) => boolean;
}

export function IndexHeader({ onAddQuestion }: IndexHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Interview Prep Hub
        </h1>
        <p className="text-muted-foreground">
          Real interview questions and answers from the community
        </p>
      </div>
      <AddInterviewQuestionDialog onAddQuestion={onAddQuestion} />
    </div>
  );
}
