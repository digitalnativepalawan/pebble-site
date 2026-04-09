import { useState } from "react";
import { useBlocks, PageBlock } from "@/contexts/BlockContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import BlockMediaEditor, { MediaData, emptyMedia } from "./BlockMediaEditor";

interface Props {
  block: PageBlock;
  open: boolean;
  onClose: () => void;
}

const TableBlockEditor = ({ block, open, onClose }: Props) => {
  const { updateBlock } = useBlocks();
  const tableData = block.content.table || { headers: [], rows: [], footnote: "" };
  const [headers, setHeaders] = useState<string[]>([...tableData.headers]);
  const [rows, setRows] = useState<string[][]>(tableData.rows.map((r: string[]) => [...r]));
  const [footnote, setFootnote] = useState(tableData.footnote || "");
  const [media, setMedia] = useState<MediaData>(block.content.media || { ...emptyMedia });

  const updateHeader = (idx: number, val: string) => {
    const h = [...headers];
    h[idx] = val;
    setHeaders(h);
  };

  const updateCell = (rowIdx: number, colIdx: number, val: string) => {
    const r = rows.map((row) => [...row]);
    r[rowIdx][colIdx] = val;
    setRows(r);
  };

  const addRow = () => {
    setRows([...rows, new Array(headers.length).fill("")]);
  };

  const deleteRow = (idx: number) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  const addColumn = () => {
    setHeaders([...headers, `Column ${headers.length + 1}`]);
    setRows(rows.map((r) => [...r, ""]));
  };

  const deleteColumn = (idx: number) => {
    setHeaders(headers.filter((_, i) => i !== idx));
    setRows(rows.map((r) => r.filter((_, i) => i !== idx)));
  };

  const save = async () => {
    await updateBlock(block.id, { table: { headers, rows, footnote }, media });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Table</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Headers */}
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Headers</Label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {headers.map((h, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Input
                    value={h}
                    onChange={(e) => updateHeader(i, e.target.value)}
                    className="w-32"
                  />
                  {headers.length > 1 && (
                    <button onClick={() => deleteColumn(i)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addColumn}>
                <Plus className="w-3 h-3 mr-1" /> Column
              </Button>
            </div>
          </div>

          {/* Rows */}
          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Rows</Label>
            <div className="space-y-2 mt-1">
              {rows.map((row, ri) => (
                <div key={ri} className="flex gap-2 items-center">
                  {row.map((cell, ci) => (
                    <Input
                      key={ci}
                      value={cell}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      className="flex-1"
                    />
                  ))}
                  <button onClick={() => deleteRow(ri)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addRow}>
                <Plus className="w-3 h-3 mr-1" /> Row
              </Button>
            </div>
          </div>

          <div>
            <Label className="font-body text-xs uppercase tracking-wider">Footnote</Label>
            <Input value={footnote} onChange={(e) => setFootnote(e.target.value)} />
          </div>

          <BlockMediaEditor media={media} onChange={setMedia} blockType="table" />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TableBlockEditor;
