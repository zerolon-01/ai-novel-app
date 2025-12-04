import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface CharacterFieldsProps {
    characters: string[];
    onChange: (chars: string[]) => void;
}

export function CharacterFields({ characters, onChange }: CharacterFieldsProps) {
    const addCharacter = () => {
        onChange([...characters, ""]);
    };

    const removeCharacter = (index: number) => {
        onChange(characters.filter((_, i) => i !== index));
    };

    const updateCharacter = (index: number, value: string) => {
        const newChars = [...characters];
        newChars[index] = value;
        onChange(newChars);
    };

    return (
        <div className="space-y-3">
            {characters.map((char, index) => (
                <div key={index} className="flex gap-2">
                    <Input
                        value={char}
                        onChange={(e) => updateCharacter(index, e.target.value)}
                        placeholder={`등장인물 ${index + 1}`}
                        className="bg-white/5"
                    />
                    {characters.length > 1 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCharacter(index)}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCharacter}
                className="w-full border-dashed border-white/20 hover:border-white/40"
            >
                <Plus className="w-4 h-4 mr-2" /> 등장인물 추가
            </Button>
        </div>
    );
}
